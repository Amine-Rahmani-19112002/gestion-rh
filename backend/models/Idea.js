const mongoose = require("mongoose");

const ideaSchema = new mongoose.Schema(
  {
    titre: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    categorie: {
      type: String,
      enum: [
        "Bien-être au travail & QVT",
        "Écologie & RSE",
        "Amélioration des outils & process",
        "Vie d'entreprise & Événements",
      ],
      default: "Bien-être au travail & QVT",
    },
    statutBadge: {
      type: String,
      default: "En cours de vote",
    },
    etapeDetails: {
      type: String,
      default: "À l'étude par le CODIR",
    },
    authorName: {
      type: String,
      required: true,
    },
    authorDepartment: {
      type: String,
      default: "Équipe RH",
    },
    authorAvatar: {
      type: String,
      default: "",
    },
    authorUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    votesCount: {
      type: Number,
      default: 0,
    },
    votesRequired: {
      type: Number,
      default: 150,
    },
    voters: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    commentsCount: {
      type: Number,
      default: 0,
    },
    comments: [
      {
        author: String,
        text: String,
        date: { type: Date, default: Date.now },
      },
    ],
    budgetAlloue: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Idea", ideaSchema);
