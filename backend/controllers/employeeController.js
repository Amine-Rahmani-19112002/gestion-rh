const Employee = require("../models/Employee");

const getEmployees = async (req, res) => {
  try {
    const { search = "", departement = "", statut = "" } = req.query;
    const filter = {};
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
    res.status(200).json(employees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getEmployeeById = async (req, res) => {
  const employee = await Employee.findById(req.params.id);
  if (!employee) {
    return res.status(404).json({ message: "Employé introuvable" });
  }
  res.status(200).json(employee);
};

const createEmployee = async (req, res) => {
  try {
    const existing = await Employee.findOne({
      $or: [
        { email: req.body.email?.toLowerCase() },
        { matricule: req.body.matricule?.toUpperCase() },
      ],
    });
    if (existing) {
      return res.status(409).json({
        message: "L'email ou le matricule existe déjà",
      });
    }
    const employee = await Employee.create(req.body);
    res.status(201).json({
      message: "Employé ajouté avec succès",
      employee,
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
res.status(200).json({
      message: "Employé modifié avec succès",
      employee,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteEmployee = async (req, res) => {
  const employee = await Employee.findByIdAndDelete(req.params.id);
  if (!employee) {
    return res.status(404).json({ message: "Employé introuvable" });
  }
  res.status(200).json({ message: "Employé supprimé avec succès" });
};
module.exports = {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
};