import Application from "../models/Application.js";
import Entity from "../models/Entity.js";

export const getDashboardStats = async (req, res) => {
  try {
    const [
      totalApplications,
      activeApplications,
      totalEntities,
      activeEntities,
    ] = await Promise.all([
      Application.countDocuments(),
      Application.countDocuments({ isActive: true }),
      Entity.countDocuments(),
      Entity.countDocuments({ isActive: true }),
    ]);

    res.json({
      success: true,
      data: {
        applications: { total: totalApplications, active: activeApplications },
        entities: { total: totalEntities, active: activeEntities },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
