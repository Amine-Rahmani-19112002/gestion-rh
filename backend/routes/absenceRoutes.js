const express = require("express");
const {
  getAbsences,
  getAbsenceById,
  createAbsence,
  updateAbsence,
  deleteAbsence
} = require("../controllers/absenceController");

const { protect, adminOnly } =  require("../middleware/authMiddleware");


const router = express.Router();
router.get("/", protect, getAbsences);
router.get("/:id", protect, getAbsenceById);
router.post("/", protect, adminOnly, createAbsence);
router.put("/:id", protect, adminOnly, updateAbsence);
router.delete("/:id", protect, adminOnly, deleteAbsence);
module.exports = router;