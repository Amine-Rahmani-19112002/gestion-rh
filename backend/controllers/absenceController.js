const Absence = require("../models/Absence");
const Employee = require("../models/Employee");

const getAbsences = async (req, res) => {
  try {
    const filter = {};

    // Si l'utilisateur n'est pas administrateur, il ne consulte que ses propres absences
    if (req.user && req.user.role !== "admin") {
      if (!req.user.employee) {
        return res.json([]);
      }
      filter.employee = req.user.employee;
    }

    if (req.query.type) filter.type = req.query.type;
    if (req.query.justifiee !== undefined) {
      filter.justifiee = req.query.justifiee === "true";
    }
    if (req.query.month) {
      const [year, month] = req.query.month.split("-");
      filter.date = {
        $gte: new Date(Number(year), Number(month) - 1, 1),
        $lt: new Date(Number(year), Number(month), 1)
      };
    }
    const absences = await Absence.find(filter)
      .populate("employee", "matricule nom prenom email poste departement typeContrat")
      .populate("createdBy", "name email")
      .sort({ date: -1 });
    res.json(absences);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAbsenceById = async (req, res) => {
  try {
    const absence = await Absence.findById(req.params.id)
      .populate("employee", "matricule nom prenom email poste departement typeContrat");
    if (!absence)
      return res.status(404).json({ message: "Absence introuvable" });

    // Contrôle d'accès pour les collaborateurs
    if (req.user && req.user.role !== "admin") {
      if (!req.user.employee || absence.employee._id.toString() !== req.user.employee.toString()) {
        return res.status(403).json({
          message: "Accès refusé. Vous ne pouvez consulter que vos propres absences.",
        });
      }
    }

    res.json(absence);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const createAbsence = async (req, res) => {
  try {
    const {
      employee, date, type, motif, justifiee,
      heureArrivee, heureDepart, retardMinutes, commentaire
    } = req.body;
    const existingEmployee = await Employee.findById(employee);
    if (!existingEmployee)
      return res.status(404).json({ message: "Employé introuvable" });
    const absence = await Absence.create({
      employee, date, type, motif, justifiee,
      heureArrivee, heureDepart,
      retardMinutes: Number(retardMinutes) || 0,
      commentaire,
      createdBy: req.user._id
    });
    const result = await Absence.findById(absence._id)
      .populate("employee", "matricule nom prenom email poste departement typeContrat");
    res.status(201).json({
      message: "Absence enregistrée avec succès",
      absence: result
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateAbsence = async (req, res) => {
  try {
    const absence = await Absence.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate("employee", "matricule nom prenom email poste departement typeContrat");
    if (!absence)
      return res.status(404).json({ message: "Absence introuvable" });
    res.json({ message: "Absence modifiée avec succès", absence });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteAbsence = async (req, res) => {
  try {
    const absence = await Absence.findByIdAndDelete(req.params.id);
    if (!absence)
      return res.status(404).json({ message: "Absence introuvable" });
    res.json({ message: "Absence supprimée avec succès" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  getAbsences,
  getAbsenceById,
  createAbsence,
  updateAbsence,
  deleteAbsence
};