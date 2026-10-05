const express = require("express");
const router = express.Router();
const {
  getEvaluations,
  createEvaluation,
  updateEvaluation,
  deleteEvaluation,
} = require("../controllers/evaluationController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

router.get("/", protect, getEvaluations);
router.post("/", protect, adminOnly, createEvaluation);
router.put("/:id", protect, updateEvaluation);
router.delete("/:id", protect, adminOnly, deleteEvaluation);

module.exports = router;
