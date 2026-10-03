const User = require("../models/User");
const Employee = require("../models/Employee");
const { sendAccountInvitationEmail } = require("../utils/emailService");

// Liste de tous les utilisateurs
const getUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select("-password -activationToken -resetPasswordToken")
      .populate(
        "employee",
        "matricule nom prenom email poste departement statut"
      )
      .sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Inviter un employé (Création de compte Zero Knowledge + envoi du lien sécurisé)
const inviteEmployeeUser = async (req, res) => {
  try {
    const { employeeId, role = "employe" } = req.body;

    if (!employeeId) {
      return res.status(400).json({ message: "L'identifiant de l'employé est requis." });
    }

    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ message: "Employé introuvable." });
    }

    // Vérifier si un compte existe déjà pour cet email ou cet employé
    let existingUser = await User.findOne({
      $or: [
        { email: employee.email.toLowerCase() },
        { employee: employee._id },
      ],
    });

    if (existingUser) {
      if (existingUser.status === "active") {
        return res.status(409).json({
          message: "Un compte actif existe déjà pour ce collaborateur.",
        });
      }
      
      // Si le compte est déjà en attente, on régénère le token et on renvoie l'invitation
      const rawToken = existingUser.createActivationToken();
      existingUser.status = "pending";
      await existingUser.save();

      const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
      const activationUrl = `${clientUrl}/activate/${rawToken}`;

      const emailResult = await sendAccountInvitationEmail({
        to: existingUser.email,
        name: existingUser.name,
        activationUrl,
        expiresHours: 48,
      });

      return res.status(200).json({
        message: "L'invitation a été réémise et transmise à l'adresse e-mail du collaborateur. Votre rôle est terminé : le compte est en attente d'activation par l'employé.",
        user: {
          id: existingUser._id,
          name: existingUser.name,
          email: existingUser.email,
          role: existingUser.role,
          status: existingUser.status,
        },
        isRealEmailSent: emailResult.isRealEmailSent,
      });
    }

    // Création d'un nouveau compte sans mot de passe avec statut "pending"
    const newUser = new User({
      name: `${employee.prenom} ${employee.nom}`,
      email: employee.email.toLowerCase(),
      role: role || "employe",
      status: "pending",
      employee: employee._id,
    });

    const rawToken = newUser.createActivationToken();
    await newUser.save();

    const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
    const activationUrl = `${clientUrl}/activate/${rawToken}`;

    const emailResult = await sendAccountInvitationEmail({
      to: newUser.email,
      name: newUser.name,
      activationUrl,
      expiresHours: 48,
    });

    return res.status(201).json({
      message: "Compte collaborateur préparé et invitation envoyée par e-mail. Votre rôle d'administrateur est terminé : le compte est en attente d'activation par l'employé.",
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        status: newUser.status,
        employee: newUser.employee,
      },
      isRealEmailSent: emailResult.isRealEmailSent,
    });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

// Renvoyer l'invitation d'activation
const resendInvitation = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: "Utilisateur introuvable." });
    }

    if (user.status === "active") {
      return res.status(400).json({
        message: "Ce compte est déjà actif. Le collaborateur peut se connecter ou réinitialiser son mot de passe en cas d'oubli.",
      });
    }

    const rawToken = user.createActivationToken();
    user.status = "pending";
    await user.save();

    const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
    const activationUrl = `${clientUrl}/activate/${rawToken}`;

    const emailResult = await sendAccountInvitationEmail({
      to: user.email,
      name: user.name,
      activationUrl,
      expiresHours: 48,
    });

    return res.status(200).json({
      message: "Un nouvel e-mail d'invitation a été transmis au collaborateur. Votre rôle est terminé en attente de l'activation par l'employé.",
      isRealEmailSent: emailResult.isRealEmailSent,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Procédure d'Offboarding / Suspension / Réactivation du compte
const toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["active", "suspended", "pending"].includes(status)) {
      return res.status(400).json({ message: "Statut invalide." });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur introuvable." });
    }

    // Protection : empêcher un admin de se suspendre lui-même
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: "Vous ne pouvez pas modifier votre propre statut administrateur." });
    }

    user.status = status;
    await user.save();

    return res.status(200).json({
      message: `Le compte est désormais ${status === "suspended" ? "suspendu" : status === "active" ? "actif" : "en attente"}.`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Suppression du compte utilisateur
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (id === req.user._id.toString()) {
      return res.status(400).json({ message: "Impossible de supprimer votre propre compte administrateur." });
    }

    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur introuvable." });
    }

    return res.status(200).json({ message: "Compte utilisateur supprimé avec succès." });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getUsers,
  inviteEmployeeUser,
  resendInvitation,
  toggleUserStatus,
  deleteUser,
};
