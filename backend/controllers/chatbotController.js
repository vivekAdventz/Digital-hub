import Application from "../models/Application.js";

export const searchApplications = async (req, res) => {
  try {
    const { query } = req.body;

    if (!query || !query.trim()) {
      return res.status(400).json({ success: false, message: "Search query is required" });
    }

    const searchTerms = query.trim().split(/\s+/);
    const regexConditions = searchTerms.map((term) => ({
      $or: [
        { name: { $regex: term, $options: "i" } },
        { description: { $regex: term, $options: "i" } },
        { problemItSolves: { $regex: term, $options: "i" } },
        { category: { $regex: term, $options: "i" } },
      ],
    }));

    const applications = await Application.find({
      isActive: true,
      $and: regexConditions,
    }).limit(10);

    // Build a simple response message
    if (applications.length === 0) {
      return res.json({
        success: true,
        message: `No applications found matching "${query}". Try different keywords.`,
        data: [],
      });
    }

    const appList = applications
      .map(
        (app, i) =>
          `${i + 1}. **${app.name}** — ${app.problemItSolves}${app.category ? ` (${app.category})` : ""}`
      )
      .join("\n");

    res.json({
      success: true,
      message: `Found ${applications.length} application(s) matching "${query}":\n\n${appList}`,
      data: applications,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
