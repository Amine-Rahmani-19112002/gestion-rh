const express = require("express");
const {
  login,
  register,
  getProfile,
  changePassword,
  verifyActivationToken,
  activateAccount,
  forgotPassword,
  verifyResetToken,
  resetPassword,
} = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Authentification & profil
router.post("/login", login);
router.post("/register", register);
router.get("/profile", protect, getProfile);
router.get("/me", protect, getProfile);
router.put("/change-password", protect, changePassword);

// Activation de compte (invitation collaborateur)
router.get("/activate/:token", verifyActivationToken);
router.post("/activate/:token", activateAccount);

// Réinitialisation de mot de passe (oubli)
router.post("/forgot-password", forgotPassword);
router.get("/reset-password/:token", verifyResetToken);
router.post("/reset-password/:token", resetPassword);

module.exports = router;