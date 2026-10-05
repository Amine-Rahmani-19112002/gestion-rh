const Department = require("../models/Department");
const getDepartments = async (req, res) => {
  try {
    let departments = await Department.find()
      .populate("manager", "matricule nom prenom email")
      .sort({ createdAt: 1 });

    if (departments.length === 0) {
      const initialDepartments = [
        {
          name: "Ingénierie & Produit",
          description: "Tech Hub Paris & Lyon",
          site: "Lyon Tech",
          managerNom: "Marc Delaunay",
          managerTitre: "VP Engineering & CPO",
          managerEmail: "m.delaunay@acme.eu",
          budgetAlloue: "4.8M€",
          effectif: 380,
          recrutementPostes: 14,
          capaciteJauge: 92,
          sousEquipes: [
            { nom: "Frontend", count: 94 },
            { nom: "Backend & Cloud", count: 162 },
            { nom: "Data & IA", count: 76 },
            { nom: "UX/UI Design", count: 48 },
          ],
          santeRH: "Excellente",
          active: true,
        },
        {
          name: "Ventes & Dév. Commercial",
          description: "Multi-sites & Terrain",
          site: "Paris HQ",
          managerNom: "Émilie Vasseur",
          managerTitre: "Chief Revenue Officer",
          managerEmail: "e.vasseur@acme.eu",
          budgetAlloue: "3.2M€",
          effectif: 260,
          recrutementPostes: 9,
          capaciteJauge: 88,
          sousEquipes: [
            { nom: "Grands Comptes", count: 85 },
            { nom: "PME & Inbound", count: 120 },
            { nom: "SDR & BDR", count: 55 },
          ],
          santeRH: "Alignée",
          active: true,
        },
        {
          name: "Marketing & Communication",
          description: "Paris HQ & Remote",
          site: "Remote",
          managerNom: "Thomas Leroy",
          managerTitre: "Directeur Brand & Growth",
          managerEmail: "t.leroy@acme.eu",
          budgetAlloue: "1.9M€",
          effectif: 110,
          recrutementPostes: 4,
          capaciteJauge: 95,
          sousEquipes: [
            { nom: "Acquisition Paid", count: 38 },
            { nom: "Brand & RP", count: 42 },
            { nom: "Content & Event", count: 30 },
          ],
          santeRH: "4.8/5",
          active: true,
        },
        {
          name: "RH & Talents",
          description: "Paris HQ & Régions",
          site: "Paris HQ",
          managerNom: "Sophie Maréchal",
          managerTitre: "Directrice des RH",
          managerEmail: "s.marechal@acme.eu",
          budgetAlloue: "1.2M€",
          effectif: 45,
          recrutementPostes: 2,
          capaciteJauge: 96,
          sousEquipes: [
            { nom: "Talent Acquisition", count: 18 },
            { nom: "Paie & Social", count: 15 },
            { nom: "Formation & QVT", count: 12 },
          ],
          santeRH: "100%",
          active: true,
        },
        {
          name: "Finance & Juridique",
          description: "Paris HQ Siège",
          site: "Paris HQ",
          managerNom: "Alexandre Benali",
          managerTitre: "Chief Financial Officer",
          managerEmail: "a.benali@acme.eu",
          budgetAlloue: "2.1M€",
          effectif: 65,
          recrutementPostes: 1,
          capaciteJauge: 98,
          sousEquipes: [
            { nom: "Contrôle de Gestion", count: 24 },
            { nom: "Comptabilité Générale", count: 26 },
            { nom: "Affaires Juridiques & DPO", count: 15 },
          ],
          santeRH: "Audit Conforme",
          active: true,
        },
        {
          name: "Support & Customer Success",
          description: "Nantes & Remote",
          site: "Remote",
          managerNom: "Clara Dupuis",
          managerTitre: "Directrice CSAT & Support",
          managerEmail: "c.dupuis@acme.eu",
          budgetAlloue: "2.4M€",
          effectif: 190,
          recrutementPostes: 4,
          capaciteJauge: 89,
          sousEquipes: [
            { nom: "Support Niveaux 1 & 2", count: 92 },
            { nom: "Customer Success Key Accounts", count: 64 },
            { nom: "Onboarding Clients", count: 34 },
          ],
          santeRH: "99.2% SLA",
          active: true,
        },
      ];
      departments = await Department.insertMany(initialDepartments);
    }

    res.json(departments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const createDepartment = async (req, res) => {
  try {
    const existing =
      await Department.findOne({ name: req.body.name });
    if (existing) {
      return res.status(409).json({
        message: "Ce departement existe deja"
      });
    }
    const department =
      await Department.create(req.body);
    res.status(201).json({
      message: "Departement cree",
      department
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
const updateDepartment = async (req, res) => {
  try {
    const department =
      await Department.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      );
    if (!department) {
      return res.status(404).json({
        message: "Departement introuvable"
      });
    }
    res.json({
      message: "Departement modifie",
      department
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
const deleteDepartment = async (req, res) => {
  try {
    const department =
      await Department.findByIdAndDelete(req.params.id);
    if (!department) {
      return res.status(404).json({
        message: "Departement introuvable"
      });
    }
    res.json({ message: "Departement supprime" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
module.exports = {
  getDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment
};