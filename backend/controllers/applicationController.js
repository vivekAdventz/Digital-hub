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
      .populate("entity", "name")
      .sort({ createdAt: -1 });

    // Filter sensitive fields for non-admins
    if (req.user.role !== "admin") {
      applications = applications.map((app) => {
        const appObj = app.toObject();
        // If visibleToEmail is set and doesn't match user's email, hide credentials
        if (appObj.visibleToEmail && appObj.visibleToEmail !== req.user.email) {
          delete appObj.appId;
          delete appObj.appPassword;
        }
        // If the user wants "show only to particular user" to mean "hide if empty",
        // we can adjust this. But usually empty means "everyone".
        return appObj;
      });
    }

    res.json({ success: true, count: applications.length, data: applications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getApplication = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id).populate("createdBy", "name email").populate("entity", "name");
    if (!application) {
      return res.status(404).json({ success: false, message: "Application not found" });
    }

    let result = application.toObject();
    if (req.user.role !== "admin") {
      if (result.visibleToEmail && result.visibleToEmail !== req.user.email) {
        delete result.appId;
        delete result.appPassword;
      }
    }

    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createApplication = async (req, res) => {
  try {
    const application = await Application.create({
      ...req.body,
      createdBy: req.user._id,
    });
    res.status(201).json({ success: true, data: application });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updateApplication = async (req, res) => {
  try {
    const application = await Application.findByIdAndUpdate(req.params.id, req.body, {
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
