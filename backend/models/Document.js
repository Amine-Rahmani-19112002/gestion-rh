const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema(
  {
    nom: {
      type: String,
      required: true,
      trim: true,
    },
    format: {
      type: String,
      enum: ["pdf", "png", "docx", "tar.gz", "xlsx", "other"],
      default: "pdf",
    },
    categorie: {
      type: String,
      enum: [
        "Bulletins de Paie",
        "Contrats RH",
        "Justificatifs légaux",
        "Attestations",
        "Politiques RH",
        "Pièce d'Identité",
      ],
      required: true,
    },
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      default: null,
    },
    collaborateurNom: {
      type: String,
      default: "Tous les salariés actifs",
    },
    collaborateurPoste: {
      type: String,
      default: "Entité France",
    },
    collaborateurInitials: {
      type: String,
      default: "RH",
    },
    taille: {
      type: String,
      default: "500 Ko",
    },
    confidentialite: {
      type: String,
      enum: [
        "Salarié uniquement",
        "RH & Collaborateur",
        "Confidentiel Direction",
        "Public Entreprise",
      ],
      default: "RH & Collaborateur",
    },
    certificatEIDAS: {
      type: Boolean,
      default: true,
    },
    hashSha256: {
      type: String,
      default: "SHA-256 certifié eIDAS",
    },
    statut: {
      type: String,
      enum: ["Conforme", "En attente RH", "À renouveler", "Expiré"],
      default: "Conforme",
    },
    alerteTexte: {
      type: String,
      default: "",
    },
    dateExpiration: {
      type: Date,
      default: null,
    },
    dateDocument: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Document", documentSchema);
