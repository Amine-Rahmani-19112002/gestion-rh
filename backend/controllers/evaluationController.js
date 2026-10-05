const Evaluation = require("../models/Evaluation");

// @desc    Obtenir toutes les évaluations (avec seed automatique)
// @route   GET /api/evaluations
// @access  Private
exports.getEvaluations = async (req, res) => {
  try {
    let evaluations = await Evaluation.find().sort({ createdAt: -1 });

    if (evaluations.length === 0) {
      const initialEvaluations = [
        {
          collaborateurNom: "Thomas Leroux",
          collaborateurPoste: "Lead Developer Backend",
          collaborateurPôle: "Tech",
          managerEvaluateur: "Alexandre Mercier",
          managerPoste: "VP Engineering",
          dateProgrammee: "14 Nov 2024",
          lieuOuLien: "Finalisé",
          statutEtape: "Terminé & Signé",
          campagne: "Campagne Annuelle 2024",
          scorePerformance: 4.8,
          talentBoxCategory: "Top Performers",
        },
        {
          collaborateurNom: "Émilie Caron",
          collaborateurPoste: "Product Marketing Lead",
          collaborateurPôle: "Mkt",
          managerEvaluateur: "Sophie Maréchal",
          managerPoste: "Directrice des RH",
          dateProgrammee: "24 Nov 2024",
          lieuOuLien: "14:30 - Salle Orion",
          statutEtape: "Planifié",
          campagne: "Campagne Annuelle 2024",
          scorePerformance: 4.4,
          talentBoxCategory: "Futurs Leaders",
        },
        {
          collaborateurNom: "Karim Belkacem",
          collaborateurPoste: "Account Executive Grand Ouest",
          collaborateurPôle: "Ventes",
          managerEvaluateur: "Valérie Dumont",
          managerPoste: "Directrice Commerciale",
          dateProgrammee: "18 Nov 2024",
          lieuOuLien: "Entretien tenu",
          statutEtape: "Attente signature",
          campagne: "Campagne Annuelle 2024",
          scorePerformance: 3.9,
          talentBoxCategory: "Cœurs de métier",
        },
        {
          collaborateurNom: "Claire Fontenoy",
          collaborateurPoste: "Contrôleuse de Gestion Senior",
          collaborateurPôle: "Finance",
          managerEvaluateur: "Marc Renault",
          managerPoste: "Directeur Administratif & Financier",
          dateProgrammee: "12 Nov 2024",
          lieuOuLien: "Finalisé",
          statutEtape: "Terminé & Signé",
          campagne: "Campagne Annuelle 2024",
          scorePerformance: 4.6,
          talentBoxCategory: "Experts solides",
        },
        {
          collaborateurNom: "Yacine Benali",
          collaborateurPoste: "Product Designer Lead",
          collaborateurPôle: "Design",
          managerEvaluateur: "Élodie Vasseur",
          managerPoste: "Head of Design",
          dateProgrammee: "28 Nov 2024",
          lieuOuLien: "10:00 - Distanciel",
          statutEtape: "Planifié",
          campagne: "Campagne Annuelle 2024",
          scorePerformance: 4.2,
          talentBoxCategory: "Piliers stables",
        },
      ];
      evaluations = await Evaluation.insertMany(initialEvaluations);
    }

    res.status(200).json(evaluations);
  } catch (error) {
    console.error("Erreur getEvaluations:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// @desc    Créer une évaluation
// @route   POST /api/evaluations
// @access  Private (Admin)
exports.createEvaluation = async (req, res) => {
  try {
    const evaluation = await Evaluation.create(req.body);
    res.status(201).json({ message: "Évaluation planifiée", evaluation });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Mettre à jour le statut d'une évaluation
// @route   PUT /api/evaluations/:id
// @access  Private
exports.updateEvaluation = async (req, res) => {
  try {
    const evaluation = await Evaluation.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!evaluation) return res.status(404).json({ message: "Évaluation introuvable" });
    res.status(200).json({ message: "Évaluation mise à jour", evaluation });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Supprimer une évaluation
// @route   DELETE /api/evaluations/:id
// @access  Private (Admin)
exports.deleteEvaluation = async (req, res) => {
  try {
    const evaluation = await Evaluation.findByIdAndDelete(req.params.id);
    if (!evaluation) return res.status(404).json({ message: "Évaluation introuvable" });
    res.status(200).json({ message: "Évaluation supprimée" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
