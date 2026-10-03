const express = require("express");
const {
  getUsers,
  inviteEmployeeUser,
  resendInvitation,
  toggleUserStatus,
  deleteUser,
} = require("../controllers/userController");

const { protect, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", protect, adminOnly, getUsers);
router.post("/invite", protect, adminOnly, inviteEmployeeUser);
router.post("/employee", protect, adminOnly, inviteEmployeeUser); // compatibilité
router.post("/:id/resend-invite", protect, adminOnly, resendInvitation);
router.patch("/:id/status", protect, adminOnly, toggleUserStatus);
router.delete("/:id", protect, adminOnly, deleteUser);

module.exports = router;