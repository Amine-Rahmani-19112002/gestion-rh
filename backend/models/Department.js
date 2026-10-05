const mongoose = require("mongoose");
const departmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Le nom est obligatoire"],
      unique: true,
      trim: true
    },
    description: {
      type: String,
      trim: true,
      default: ""
    },
    site: {
      type: String,
      default: "Manzel Tmim, Nabeul Tunisie"
    },
    manager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      default: null
    },
    managerNom: {
      type: String,
      default: ""
    },
    managerTitre: {
      type: String,
      default: ""
    },
    managerEmail: {
      type: String,
      default: ""
    },
    budgetAlloue: {
      type: String,
      default: "1.5M€"
    },
    effectif: {
      type: Number,
      default: 25
    },
    recrutementPostes: {
      type: Number,
      default: 2
    },
    capaciteJauge: {
      type: Number,
      default: 90
    },
    sousEquipes: [
      {
        nom: String,
        count: Number
      }
    ],
    santeRH: {
      type: String,
      default: "Excellente"
    },
    active: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);
module.exports =
  mongoose.model("Department", departmentSchema);