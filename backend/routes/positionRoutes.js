const express = require("express");
const {
  getPositions,
  createPosition,
   updatePosition,
  deletePosition
} = require("../controllers/positionController");

const { protect, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();
router.get("/", protect, getPositions);
router.post("/", protect, adminOnly, createPosition);
router.put("/:id", protect, adminOnly, updatePosition);
router.delete("/:id", protect, adminOnly, deletePosition);
module.exports = router;