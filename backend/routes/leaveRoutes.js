const express = require("express");
const {
  getLeaves,
  createLeave,
  approveLeave,
  rejectLeave,
  cancelLeave,
  updateLeave,
} = require("../controllers/leaveController");

const { protect, adminOnly } = require("../middleware/authMiddleware");
const router = express.Router();

router.get("/", protect, getLeaves);
router.post("/", protect, createLeave);
router.put("/:id/approve", protect, adminOnly, approveLeave);
router.put("/:id/reject", protect, adminOnly, rejectLeave);
router.put("/:id", protect, updateLeave);
router.delete("/:id", protect, cancelLeave);
module.exports = router;