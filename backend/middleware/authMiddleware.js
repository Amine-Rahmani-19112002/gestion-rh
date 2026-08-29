// Authentication middleware to protect routes and check for admin access
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  try {
    const authorization = req.headers.authorization;
    if (!authorization || !authorization.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Accès refusé. Token manquant.",
      });
    }
    const token = authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).json({ message: "Utilisateur introuvable" });
    }
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      message: "Token invalide ou expiré",
    });
  }
};


const adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({
      message: "Accès réservé à l'administrateur",
    });
  }
  next();
} 

module.exports = { protect, adminOnly };

