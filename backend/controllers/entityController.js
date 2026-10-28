import Entity from "../models/Entity.js";

export const getEntities = async (req, res) => {
  try {
    const { search, isActive } = req.query;
    const filter = {};

    if (isActive !== undefined) filter.isActive = isActive === "true";
    if (search) {
      filter.name = { $regex: search, $options: "i" };
    }

    const entities = await Entity.find(filter)
      .populate("createdBy", "name email")
      .sort({ sortOrder: 1, createdAt: -1 });

    res.json({ success: true, count: entities.length, data: entities });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getEntity = async (req, res) => {
  try {
    const entity = await Entity.findById(req.params.id).populate("createdBy", "name email");
    if (!entity) {
      return res.status(404).json({ success: false, message: "Entity not found" });
    }
    res.json({ success: true, data: entity });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createEntity = async (req, res) => {
  try {
    const entity = await Entity.create({
      ...req.body,
      createdBy: req.user._id,
    });
    res.status(201).json({ success: true, data: entity });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: "Entity name already exists" });
    }
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updateEntity = async (req, res) => {
  try {
    const entity = await Entity.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!entity) {
      return res.status(404).json({ success: false, message: "Entity not found" });
    }
    res.json({ success: true, data: entity });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: "Entity name already exists" });
    }
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteEntity = async (req, res) => {
  try {
    const entity = await Entity.findByIdAndDelete(req.params.id);
    if (!entity) {
      return res.status(404).json({ success: false, message: "Entity not found" });
    }
    res.json({ success: true, message: "Entity deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const toggleEntityStatus = async (req, res) => {
  try {
    const entity = await Entity.findById(req.params.id);
    if (!entity) {
      return res.status(404).json({ success: false, message: "Entity not found" });
    }
    entity.isActive = !entity.isActive;
    await entity.save();
    res.json({ success: true, data: entity });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const reorderEntities = async (req, res) => {
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
      await Entity.bulkWrite(bulkOps);
    }
    res.json({ success: true, message: "Entity order saved" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
