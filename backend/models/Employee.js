const express = require("express");
const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema
( {
    matricule: {
      type: String,
      required: [true, "Le matricule est obligatoire"],
      unique: true,
      trim: true,
      uppercase: true,
    },

    nom: { type: String, required: true, trim: true },
    prenom: { type: String, required: true, trim: true },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    telephone: { type: String, default: "", trim: true },
    adresse: { type: String, default: "", trim: true },
    poste: { type: String, required: true, trim: true },
    departement: { type: String, required: true, trim: true },
    typeContrat: {
      type: String,
      enum: ["CDI", "CDD", "Stage", "Freelance"],
      default: "CDI",
    },
    dateEmbauche: { type: Date, required: true },
    salaire: { type: Number, min: 0, default: 0 },
    statut: {
      type: String,
      enum: ["Actif", "Inactif", "En congé"],
      default: "Actif",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Employee", employeeSchema);