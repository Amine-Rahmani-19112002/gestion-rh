const mongoose = require("mongoose");

const contractSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    collaborateurNom: {
      type: String,
      required: true,
      trim: true,
    },
    collaborateurEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    matricule: {
      type: String,
      required: true,
      trim: true,
    },
    poste: {
      type: String,
      required: true,
      trim: true,
    },
    departement: {
      type: String,
      required: true,
      trim: true,
    },
    typeContrat: {
      type: String,
      enum: [
        "CDI Cadre",
        "CDI",
        "CDD Remplacement",
        "CDD",
        "CDI Essai",
        "Alternance",
        "Contrat Prestation Cadre",
        "Stage",
        "Freelance",
      ],
      default: "CDI Cadre",
    },
    dateDebut: {
      type: Date,
      required: true,
    },
    dateFin: {
      type: Date,
      default: null,
    },
    periodeEssaiFin: {
      type: Date,
      default: null,
    },
    remunerationAnnuelle: {
      type: Number,
      default: 0,
    },
    remunerationMensuelle: {
      type: Number,
      default: 0,
    },
    modalite: {
      type: String,
      default: "Forfait Jours",
    },
    statut: {
      type: String,
      enum: [
        "Actif & Signé",
        "Signature Avenant en cours",
        "Renouvellement / Sortie",
        "Échéance Essai Imminente",
        "Dossier Conforme",
        "Bon de commande N°4 en cours",
        "En cours",
        "Terminé",
      ],
      default: "Actif & Signé",
    },
    alertJuridique: {
      type: String,
      default: "",
    },
    isAlerteCritique: {
      type: Boolean,
      default: false,
    },
    avenantsCount: {
      type: Number,
      default: 0,
    },
    documentUrl: {
      type: String,
      default: "",
    },
    notes: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Contract", contractSchema);
