import Application from "../models/Application.js";

export const getApplications = async (req, res) => {
  try {
    const { search, isActive, category } = req.query;
    const filter = {};

    if (isActive !== undefined) filter.isActive = isActive === "true";
    if (category) filter.category = category;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { problemItSolves: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
      ];
    }

    let applications = await Application.find(filter)
      .populate("createdBy", "name email")
      .populate("entity", "name sortOrder isActive")
      .sort({ sortOrder: 1, createdAt: -1 });

    // Filter sensitive fields for non-admins
    if (req.user.role !== "admin") {
      const userEmail = req.user.email?.toLowerCase();
      applications = applications.map((app) => {
        const appObj = app.toObject();

        let matchedCred = null;

        // 1. Check userCredentials array
        if (Array.isArray(appObj.userCredentials) && appObj.userCredentials.length > 0) {
          // Look for exact match by user's email
          if (userEmail) {
            matchedCred = appObj.userCredentials.find(
              (c) => c.email && c.email.trim().toLowerCase() === userEmail
            );
          }
          // If no email-specific match, check if there is a general credential (empty email)
          if (!matchedCred) {
            matchedCred = appObj.userCredentials.find(
              (c) => !c.email || c.email.trim() === ""
            );
          }

          if (matchedCred) {
            appObj.appId = matchedCred.appId;
            appObj.appPassword = matchedCred.appPassword;
          } else {
            // User not authorized to see credentials
            delete appObj.appId;
            delete appObj.appPassword;
          }
        } else {
          // 2. Legacy fallback: check visibleToEmails / visibleToEmail
          const allowedEmails = [
            ...(Array.isArray(appObj.visibleToEmails) ? appObj.visibleToEmails : []),
            ...(appObj.visibleToEmail ? [appObj.visibleToEmail] : []),
          ]
            .map((e) => (typeof e === "string" ? e.trim().toLowerCase() : ""))
            .filter(Boolean);

          if (allowedEmails.length > 0 && (!userEmail || !allowedEmails.includes(userEmail))) {
            delete appObj.appId;
            delete appObj.appPassword;
          }
        }

        // Hide full userCredentials list from non-admin users for security
        delete appObj.userCredentials;

        return appObj;
      });
    }

    // Sort applications primarily by Entity sortOrder, then by Application sortOrder
    applications.sort((a, b) => {
      const entitySortA = a.entity?.sortOrder ?? 999999;
      const entitySortB = b.entity?.sortOrder ?? 999999;
      if (entitySortA !== entitySortB) {
        return entitySortA - entitySortB;
      }
      const appSortA = a.sortOrder ?? 0;
      const appSortB = b.sortOrder ?? 0;
      if (appSortA !== appSortB) {
        return appSortA - appSortB;
      }
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    res.json({ success: true, count: applications.length, data: applications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getApplication = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate("createdBy", "name email")
      .populate("entity", "name sortOrder isActive");
    if (!application) {
      return res.status(404).json({ success: false, message: "Application not found" });
    }

    let result = application.toObject();
    if (req.user.role !== "admin") {
      const userEmail = req.user.email?.toLowerCase();
      let matchedCred = null;

      if (Array.isArray(result.userCredentials) && result.userCredentials.length > 0) {
        if (userEmail) {
          matchedCred = result.userCredentials.find(
            (c) => c.email && c.email.trim().toLowerCase() === userEmail
          );
        }
        if (!matchedCred) {
          matchedCred = result.userCredentials.find(
            (c) => !c.email || c.email.trim() === ""
          );
        }

        if (matchedCred) {
          result.appId = matchedCred.appId;
          result.appPassword = matchedCred.appPassword;
        } else {
          delete result.appId;
          delete result.appPassword;
        }
      } else {
        const allowedEmails = [
          ...(Array.isArray(result.visibleToEmails) ? result.visibleToEmails : []),
          ...(result.visibleToEmail ? [result.visibleToEmail] : []),
        ]
          .map((e) => (typeof e === "string" ? e.trim().toLowerCase() : ""))
          .filter(Boolean);

        if (allowedEmails.length > 0 && (!userEmail || !allowedEmails.includes(userEmail))) {
          delete result.appId;
          delete result.appPassword;
        }
      }

      delete result.userCredentials;
    }

    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createApplication = async (req, res) => {
  try {
    const data = { ...req.body };

    if (Array.isArray(data.userCredentials)) {
      data.userCredentials = data.userCredentials
        .map((c) => ({
          email: typeof c.email === "string" ? c.email.trim().toLowerCase() : "",
          appId: typeof c.appId === "string" ? c.appId.trim() : "",
          appPassword: typeof c.appPassword === "string" ? c.appPassword.trim() : "",
        }))
        .filter((c) => c.appId || c.appPassword || c.email);

      if (data.userCredentials.length > 0) {
        if (!data.appId) data.appId = data.userCredentials[0].appId;
        if (!data.appPassword) data.appPassword = data.userCredentials[0].appPassword;
        data.visibleToEmails = data.userCredentials
          .map((c) => c.email)
          .filter(Boolean);
        data.visibleToEmail = data.visibleToEmails[0] || "";
      }
    } else if (Array.isArray(data.visibleToEmails)) {
      data.visibleToEmails = data.visibleToEmails
        .map((e) => (typeof e === "string" ? e.trim().toLowerCase() : ""))
        .filter(Boolean);
      data.visibleToEmail = data.visibleToEmails[0] || "";
    } else if (data.visibleToEmail) {
      data.visibleToEmails = [data.visibleToEmail.trim().toLowerCase()];
    }

    const application = await Application.create({
      ...data,
      createdBy: req.user._id,
    });
    res.status(201).json({ success: true, data: application });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updateApplication = async (req, res) => {
  try {
    const data = { ...req.body };

    if (Array.isArray(data.userCredentials)) {
      data.userCredentials = data.userCredentials
        .map((c) => ({
          email: typeof c.email === "string" ? c.email.trim().toLowerCase() : "",
          appId: typeof c.appId === "string" ? c.appId.trim() : "",
          appPassword: typeof c.appPassword === "string" ? c.appPassword.trim() : "",
        }))
        .filter((c) => c.appId || c.appPassword || c.email);

      if (data.userCredentials.length > 0) {
        if (!data.appId) data.appId = data.userCredentials[0].appId;
        if (!data.appPassword) data.appPassword = data.userCredentials[0].appPassword;
        data.visibleToEmails = data.userCredentials
          .map((c) => c.email)
          .filter(Boolean);
        data.visibleToEmail = data.visibleToEmails[0] || "";
      } else {
        data.userCredentials = [];
      }
    } else if (Array.isArray(data.visibleToEmails)) {
      data.visibleToEmails = data.visibleToEmails
        .map((e) => (typeof e === "string" ? e.trim().toLowerCase() : ""))
        .filter(Boolean);
      data.visibleToEmail = data.visibleToEmails[0] || "";
    } else if (data.visibleToEmail !== undefined) {
      data.visibleToEmails = data.visibleToEmail ? [data.visibleToEmail.trim().toLowerCase()] : [];
    }

    const application = await Application.findByIdAndUpdate(req.params.id, data, {
      new: true,
      runValidators: true,
    });
    if (!application) {
      return res.status(404).json({ success: false, message: "Application not found" });
    }
    res.json({ success: true, data: application });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteApplication = async (req, res) => {
  try {
    const application = await Application.findByIdAndDelete(req.params.id);
    if (!application) {
      return res.status(404).json({ success: false, message: "Application not found" });
    }
    res.json({ success: true, message: "Application deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const toggleApplicationStatus = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ success: false, message: "Application not found" });
    }
    application.isActive = !application.isActive;
    await application.save();
    res.json({ success: true, data: application });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const reorderApplications = async (req, res) => {
  try {
    const { orders } = req.body; // [{ id, sortOrder }, ...]
    if (!Array.isArray(orders)) {
      return res.status(400).json({ success: false, message: "orders must be an array" });
    }
    const bulkOps = orders
      .filter((item) => item && item.id)
      .map(({ id, sortOrder }) => ({
        updateOne: { filter: { _id: id }, update: { $set: { sortOrder: Number(sortOrder) || 0 } } },
      }));
    if (bulkOps.length > 0) {
      await Application.bulkWrite(bulkOps);
    }
    res.json({ success: true, message: "Order saved" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
