const mongoose = require("mongoose");
const leaveSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    typeConge: {
      type: String,
      enum: [
        "Congé annuel",
        "Congé maladie",
        "Congé sans solde",
        "Congé maternité",
        "Congé paternité",
        "Autre",
      ],
      required: true,
    },
    dateDebut: { type: Date, required: true },
    dateFin: { type: Date, required: true },
    nombreJours: { type: Number, required: true, min: 1 },
    motif: { type: String, required: true, trim: true },
    statut: {
      type: String,
      enum: ["En attente", "Approuvé", "Refusé", "Annulé"],
      default: "En attente",
    },
    commentaireAdmin: { type: String, default: "", trim: true },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    reviewedAt: { type: Date, default: null },
  },
  { timestamps: true }
);
module.exports = mongoose.model("Leave", leaveSchema);