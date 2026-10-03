const Employee = require("../models/Employee");
const User = require("../models/User");
const { sendAccountInvitationEmail } = require("../utils/emailService");

const getEmployees = async (req, res) => {
  try {
    const { search = "", departement = "", statut = "" } = req.query;
    const filter = {};

    // Si le compte est de rôle employé, il ne peut voir que sa propre fiche
    if (req.user && req.user.role === "employe") {
      if (!req.user.employee) {
        return res.status(200).json([]);
      }
      filter._id = req.user.employee;
    }

    if (search) {
      filter.$or = [
        { nom: { $regex: search, $options: "i" } },
        { prenom: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { matricule: { $regex: search, $options: "i" } },
      ];
    }
    if (departement) filter.departement = departement;
    if (statut) filter.statut = statut;

    const employees = await Employee.find(filter).sort({ createdAt: -1 });

    // Récupération des comptes utilisateurs associés
    const employeeIds = employees.map((e) => e._id);
    const userAccounts = await User.find({
      employee: { $in: employeeIds },
    }).select("_id email role status employee createdAt");

    const userMap = {};
    userAccounts.forEach((u) => {
      if (u.employee) userMap[u.employee.toString()] = u;
    });

    const employeesWithUser = employees.map((emp) => {
      const empObj = emp.toObject();
      empObj.userAccount = userMap[emp._id.toString()] || null;
      return empObj;
    });

    res.status(200).json(employeesWithUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getEmployeeById = async (req, res) => {
  try {
    // Si l'utilisateur est un employé, vérification d'accès à son propre dossier
    if (req.user && req.user.role === "employe") {
      if (!req.user.employee || req.user.employee.toString() !== req.params.id) {
        return res.status(403).json({
          message: "Accès refusé. Vous ne pouvez consulter que votre propre dossier.",
        });
      }
    }

    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: "Employé introuvable" });
    }
    const userAccount = await User.findOne({ employee: employee._id }).select(
      "_id email role status createdAt"
    );
    const empObj = employee.toObject();
    empObj.userAccount = userAccount;
    res.status(200).json(empObj);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createEmployee = async (req, res) => {
  try {
    const {
      matricule,
      nom,
      prenom,
      email,
      telephone,
      adresse,
      poste,
      departement,
      typeContrat,
      dateEmbauche,
      salaire,
      statut,
      sendInvitation = true, // Par défaut, invite automatiquement le collaborateur
      role = "employe",
    } = req.body;

    const existing = await Employee.findOne({
      $or: [
        { email: email?.toLowerCase() },
        { matricule: matricule?.toUpperCase() },
      ],
    });

    if (existing) {
      return res.status(409).json({
        message: "L'email ou le matricule existe déjà",
      });
    }

    const employee = await Employee.create({
      matricule,
      nom,
      prenom,
      email,
      telephone,
      adresse,
      poste,
      departement,
      typeContrat,
      dateEmbauche,
      salaire,
      statut: statut || "Actif",
    });

    let createdUser = null;
    let activationUrl = null;

    // Si demandé, création automatique du compte utilisateur "pending" et envoi du lien sécurisé
    const shouldSendInvitation = sendInvitation === true || sendInvitation === "true";
    if (shouldSendInvitation) {
      let user = await User.findOne({
        $or: [
          { email: employee.email.toLowerCase() },
          { employee: employee._id },
        ],
      });

      if (!user) {
        user = new User({
          name: `${employee.prenom} ${employee.nom}`,
          email: employee.email.toLowerCase(),
          role: role || "employe",
          status: "pending",
          employee: employee._id,
        });
      } else {
        user.employee = employee._id;
        user.name = `${employee.prenom} ${employee.nom}`;
        if (role) user.role = role;
      }

      if (user.status !== "active") {
        user.status = "pending";
        const rawToken = user.createActivationToken();
        await user.save();

        const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
        activationUrl = `${clientUrl}/activate/${rawToken}`;

        const emailResult = await sendAccountInvitationEmail({
          to: user.email,
          name: user.name,
          activationUrl,
          expiresHours: 48,
        });

        createdUser = {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          status: user.status,
        };

        return res.status(201).json({
          message: "Collaborateur ajouté avec succès. Une invitation sécurisée a été transmise à son adresse e-mail. Votre rôle d'administrateur est terminé : le compte est en attente d'activation par l'employé.",
          employee,
          userAccount: createdUser,
          isRealEmailSent: emailResult.isRealEmailSent,
        });
      } else {
        await user.save();
        createdUser = {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          status: user.status,
        };
      }
    }

    res.status(201).json({
      message: "Employé ajouté avec succès.",
      employee,
      userAccount: createdUser,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateEmployee = async (req, res) => {
  try {
    const duplicate = await Employee.findOne({
      _id: { $ne: req.params.id },
      $or: [
        { email: req.body.email?.toLowerCase() },
        { matricule: req.body.matricule?.toUpperCase() },
      ],
    });

    if (duplicate) {
      return res.status(409).json({
        message: "Email ou matricule déjà utilisé",
      });
    }

    const employee = await Employee.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!employee) {
      return res.status(404).json({ message: "Employé introuvable" });
    }

    // Synchronisation avec le compte utilisateur rattaché
    const linkedUser = await User.findOne({ employee: employee._id });
    if (linkedUser) {
      if (req.body.email && req.body.email.toLowerCase() !== linkedUser.email) {
        linkedUser.email = req.body.email.toLowerCase();
      }
      if (req.body.nom || req.body.prenom) {
        linkedUser.name = `${employee.prenom} ${employee.nom}`;
      }

      // Offboarding automatique : si le statut de l'employé devient "Inactif", on suspend son compte utilisateur
      if (req.body.statut === "Inactif" && linkedUser.status === "active") {
        linkedUser.status = "suspended";
      }

      await linkedUser.save();
    }

    res.status(200).json({
      message: "Employé modifié avec succès",
      employee,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteEmployee = async (req, res) => {
  try {
    const employee = await Employee.findByIdAndDelete(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: "Employé introuvable" });
    }

    // Suppression / dissociation du compte utilisateur lié lors du départ
    await User.deleteMany({ employee: employee._id });

    res.status(200).json({ message: "Employé et son compte d'accès supprimés avec succès" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
};