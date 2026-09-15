const express = require("express");
const router = express.Router();
const { 
  clockIn, 
  clockOut, 
  updateStatus, 
  getMyPointage 
} = require("../controllers/pointageController");
const { protect } = require("../middleware/authMiddleware");

// Routes privées (nécessitent d'être authentifié)
router.post("/clock-in", protect, clockIn);
router.post("/clock-out", protect, clockOut);
router.post("/status", protect, updateStatus);
router.get("/me", protect, getMyPointage);

module.exports = router;
