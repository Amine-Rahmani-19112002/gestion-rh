const mongoose = require("mongoose");
const absenceSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee",
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  type: {
    type: String,
    enum: ["Absence", "Retard", "Départ anticipé", "Télétravail"],
    default: "Absence"
  },
  motif: {
    type: String,
    trim: true,
    default: ""
  },
  justifiee: {
    type: Boolean,
    default: false
  },
  heureArrivee: {
    type: String,
    default: ""
  },
  heureDepart: {
    type: String,
    default: ""
  },
  retardMinutes: {
    type: Number,
    min: 0,
    default: 0
  },
  commentaire: {
    type: String,
    default: ""
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  }
}, { timestamps: true });
module.exports = mongoose.model("Absence", absenceSchema);