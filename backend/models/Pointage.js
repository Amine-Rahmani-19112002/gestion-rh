const mongoose = require("mongoose");

const pointageSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
      required: true,
    },
    clockInTime: {
      type: Date,
    },
    clockOutTime: {
      type: Date,
    },
    ipAddress: {
      type: String,
    },
    location: {
      lat: { type: Number },
      lng: { type: Number },
    },
    status: {
      type: String,
      enum: ["En ligne", "Inactif", "Terminé", "Anomalie", "Non pointé"],
      default: "En ligne",
    },
    anomalieDetails: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Pointage", pointageSchema);
