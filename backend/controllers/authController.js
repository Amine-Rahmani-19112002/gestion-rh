const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const User = require("../models/User"); 
const { sendPasswordResetEmail, sendRegistrationEmail } = require("../utils/emailService");

const generateToken = (user) => { 
  return jwt.sign( 
    {
      id: user._id, 
      role: user.role,
      status: user.status,
    }, 
    process.env.JWT_SECRET, 
    { 
      expiresIn: "7d", 
    } 
  ); 
}; 

// Connexion utilisateur avec vérification du statut du compte
const login = async (req, res) => { 
  try { 
    const { email, password } = req.body; 
    
    if (!email || !password) { 
      return res.status(400).json({ 
        message: "Email et mot de passe obligatoires", 
      }); 
    } 
  
    const user = await User.findOne({ 
      email: email.toLowerCase(), 
    }); 
  
    if (!user) { 
      return res.status(401).json({ 
        message: "Email ou mot de passe incorrect", 
      }); 
    } 

    // Vérification du statut du compte
    if (user.status === "pending") {
      return res.status(403).json({
        message: "Votre compte est en attente d'activation. Veuillez vérifier votre boîte mail et cliquer sur le lien d'invitation pour définir votre mot de passe.",
        status: "pending",
      });
    }

    if (user.status === "suspended") {
      return res.status(403).json({
        message: "Votre compte a été suspendu par l'administrateur. Veuillez contacter les ressources humaines.",
        status: "suspended",
      });
    }
  
    const isMatch = await user.matchPassword(password); 
  
    if (!isMatch) { 
      return res.status(401).json({ 
        message: "Email ou mot de passe incorrect", 
      }); 
    } 
  
    return res.status(200).json({ 
      message: "Connexion réussie", 
      token: generateToken(user), 
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email, 
        role: user.role, 
        status: user.status,
        employee: user.employee,
      }, 
    }); 
  } catch (error) { 
    return res.status(500).json({ 
      message: "Erreur serveur lors de la connexion", 
      error: error.message, 
    }); 
  } 
}; 

// Récupération du profil connecté
const getProfile = async (req, res) => { 
  try { 
    const user = await User.findById(req.user.id).select("-password"); 
  
    if (!user) { 
      return res.status(404).json({ 
        message: "Utilisateur introuvable", 
      }); 
    } 
  
    return res.status(200).json(user); 
  } catch (error) { 
    return res.status(500).json({ 
      message: "Erreur serveur", 
      error: error.message, 
    }); 
  } 
}; 

// Changement de mot de passe connecté
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);

    const validPassword = await user.matchPassword(currentPassword);
    if (!validPassword) {
      return res.status(400).json({
        message: "Mot de passe actuel incorrect",
      });
    }

    if (!newPassword || newPassword.length < 8) {
      return res.status(400).json({
        message: "Le nouveau mot de passe doit contenir au moins 8 caractères",
      });
    }

    user.password = newPassword;
    await user.save();
    res.json({
      message: "Mot de passe modifié avec succès",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Vérifier la validité du token d'activation (GET)
const verifyActivationToken = async (req, res) => {
  try {
    const { token } = req.params;
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      activationToken: hashedToken,
      activationExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        valid: false,
        message: "Le lien d'activation est invalide ou a expiré. Veuillez demander un nouveau lien à votre administrateur RH.",
      });
    }

    return res.status(200).json({
      valid: true,
      name: user.name,
      email: user.email,
    });
  } catch (error) {
    return res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

// Activer le compte employé et définir son mot de passe initial (POST)
const activateAccount = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password || password.length < 8) {
      return res.status(400).json({
        message: "Le mot de passe doit contenir au moins 8 caractères.",
      });
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      activationToken: hashedToken,
      activationExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        message: "Le lien d'activation est invalide ou a expiré. Veuillez contacter votre administrateur RH pour recevoir une nouvelle invitation.",
      });
    }

    // Mise à jour de l'utilisateur : définition du mot de passe et activation du compte
    user.password = password;
    user.status = "active";
    user.activationToken = null;
    user.activationExpires = null;

    await user.save();

    return res.status(200).json({
      message: "Félicitations ! Votre compte a été activé avec succès.",
      token: generateToken(user),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        employee: user.employee,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: "Erreur serveur lors de l'activation du compte",
      error: error.message,
    });
  }
};

// Demande de réinitialisation de mot de passe (POST)
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "L'adresse email est requise" });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    // Sécurité : même si l'utilisateur n'existe pas, on répond positivement pour éviter l'énumération
    if (!user) {
      return res.status(200).json({
        message: "Si un compte est associé à cette adresse e-mail, vous recevrez un lien de réinitialisation dans quelques instants.",
      });
    }

    if (user.status === "suspended") {
      return res.status(403).json({
        message: "Ce compte a été suspendu. Veuillez contacter l'administrateur RH.",
      });
    }

    const rawToken = user.createResetPasswordToken();
    await user.save();

    const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
    const resetUrl = `${clientUrl}/reset-password/${rawToken}`;

    await sendPasswordResetEmail({
      to: user.email,
      name: user.name,
      resetUrl,
      expiresMinutes: 60,
    });

    return res.status(200).json({
      message: "Si un compte est associé à cette adresse e-mail, vous recevrez un lien de réinitialisation dans quelques instants.",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Erreur lors de la demande de réinitialisation",
      error: error.message,
    });
  }
};

// Vérifier la validité du token de réinitialisation (GET)
const verifyResetToken = async (req, res) => {
  try {
    const { token } = req.params;
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        valid: false,
        message: "Le lien de réinitialisation est invalide ou a expiré.",
      });
    }

    return res.status(200).json({
      valid: true,
      email: user.email,
    });
  } catch (error) {
    return res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

// Réinitialiser le mot de passe (POST)
const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password || password.length < 8) {
      return res.status(400).json({
        message: "Le nouveau mot de passe doit contenir au moins 8 caractères.",
      });
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        message: "Le lien de réinitialisation est invalide ou a expiré. Veuillez refaire une demande.",
      });
    }

    user.password = password;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    if (user.status === "pending") {
      user.status = "active";
    }

    await user.save();

    return res.status(200).json({
      message: "Votre mot de passe a été réinitialisé avec succès. Vous pouvez maintenant vous connecter.",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Erreur lors de la réinitialisation du mot de passe",
      error: error.message,
    });
  }
};

// Inscription d'un nouvel utilisateur (POST /auth/register)
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Tous les champs (nom, email, mot de passe) sont obligatoires.",
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        message: "Format d'adresse e-mail invalide.",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        message: "Le mot de passe doit contenir au moins 8 caractères.",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      if (existingUser.status === "active") {
        return res.status(409).json({
          message: "Un compte actif existe déjà avec cette adresse e-mail. Veuillez vous connecter.",
        });
      }

      // Si le compte est encore en attente, on régénère le token et on renvoie l'e-mail
      existingUser.name = name.trim();
      existingUser.password = password;
      const rawToken = existingUser.createActivationToken();
      await existingUser.save();

      const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
      const activationUrl = `${clientUrl}/activate/${rawToken}`;

      const emailResult = await sendRegistrationEmail({
        to: existingUser.email,
        name: existingUser.name,
        activationUrl,
        expiresHours: 48,
      });

      return res.status(200).json({
        message: emailResult.isRealEmailSent
          ? "Un nouvel e-mail de confirmation a été envoyé à votre adresse e-mail. Veuillez vérifier votre boîte de réception pour activer votre compte."
          : "Votre compte est en attente d'activation. Un e-mail de confirmation a été généré.",
        isRealEmailSent: emailResult.isRealEmailSent,
        activationUrl,
      });
    }

    // Création d'un nouveau compte avec statut "pending"
    const newUser = new User({
      name: name.trim(),
      email: normalizedEmail,
      password,
      role: "employe",
      status: "pending",
    });

    const rawToken = newUser.createActivationToken();
    await newUser.save();

    const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
    const activationUrl = `${clientUrl}/activate/${rawToken}`;

    const emailResult = await sendRegistrationEmail({
      to: newUser.email,
      name: newUser.name,
      activationUrl,
      expiresHours: 48,
    });

    return res.status(201).json({
      message: emailResult.isRealEmailSent
        ? "Inscription réussie ! Un e-mail de confirmation a été envoyé dans votre boîte de réception. Veuillez cliquer sur le lien pour activer votre compte."
        : "Inscription prise en compte ! Un e-mail de confirmation a été préparé.",
      isRealEmailSent: emailResult.isRealEmailSent,
      activationUrl,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Erreur serveur lors de l'inscription",
      error: error.message,
    });
  }
};

module.exports = { 
  login, 
  register,
  getProfile,
  changePassword,
  verifyActivationToken,
  activateAccount,
  forgotPassword,
  verifyResetToken,
  resetPassword,
};