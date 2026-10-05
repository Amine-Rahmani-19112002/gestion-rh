const Position = require("../models/Position");
const getPositions = async (req, res) => {
  try {
    const positions = await Position.find()
      .populate("department", "name")
      .sort({ title: 1 });
    res.json(positions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const createPosition = async (req, res) => {
  try {
    const position = await Position.create(req.body);
    res.status(201).json({
      message: "Poste cree",
      position
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
const updatePosition = async (req, res) => {
  try {
    const position =
      await Position.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      );
    if (!position) {
      return res.status(404).json({
        message: "Poste introuvable"
      });
    }
    res.json({
      message: "Poste modifie",
      position
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
const deletePosition = async (req, res) => {
  try {
    const position =
      await Position.findByIdAndDelete(req.params.id);
    if (!position) {
      return res.status(404).json({
        message: "Poste introuvable"
      });
    }
    res.json({ message: "Poste supprime" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
module.exports = {
  getPositions,
  createPosition,
  updatePosition,
  deletePosition
};