const mongoose = require("mongoose");

const evaluationSchema = new mongoose.Schema(
  {
    collaborateurNom: {
      type: String,
      required: true,
    },
    collaborateurPoste: {
      type: String,
      required: true,
    },
    collaborateurPôle: {
      type: String,
      default: "Tech",
    },
    collaborateurAvatar: {
      type: String,
      default: "",
    },
    managerEvaluateur: {
      type: String,
      required: true,
    },
    managerPoste: {
      type: String,
      default: "Directeur de Département",
    },
    dateProgrammee: {
      type: String,
      default: "2024-11-20",
    },
    lieuOuLien: {
      type: String,
      default: "Finalisé",
    },
    statutEtape: {
      type: String,
      enum: ["Terminé & Signé", "Planifié", "Attente signature", "En cours"],
      default: "Planifié",
    },
    campagne: {
      type: String,
      default: "Campagne Annuelle 2024 - Bilan & Perspectives",
    },
    scorePerformance: {
      type: Number,
      default: 4.2,
    },
    talentBoxCategory: {
      type: String,
      enum: [
        "Énigmes",
        "Futurs Leaders",
        "Top Performers",
        "Dilemmes",
        "Cœurs de métier",
        "Piliers stables",
        "À recadrer",
        "Spécialistes",
        "Experts solides",
      ],
      default: "Cœurs de métier",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Evaluation", evaluationSchema);
