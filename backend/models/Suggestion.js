const mongoose = require('mongoose');
const suggestionSchema = new mongoose.Schema({
  titre: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  categorie: {
    type: String,
    enum: ['Bien-être & QVT', 'Écologie & RSE', 'Amélioration process', 'Vie d\'entreprise', 'Formation', 'Autre'],
    default: 'Autre'
  },
  auteur: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  auteurNom: { type: String, required: true },
  statut: {
    type: String,
    enum: ['En cours de vote', 'En revue', 'Adopté', 'Rejeté', 'Planifié'],
    default: 'En cours de vote'
  },
  votes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  votesCount: { type: Number, default: 0 },
  commentaires: [{
    auteur: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    auteurNom: String,
    texte: String,
    date: { type: Date, default: Date.now }
  }],
  commentairesCount: { type: Number, default: 0 },
  seuilVotes: { type: Number, default: 150 },
  priorite: { type: String, enum: ['Basse', 'Moyenne', 'Haute'], default: 'Moyenne' },
  reponseAdmin: { type: String, default: '' },
}, { timestamps: true });
module.exports = mongoose.model('Suggestion', suggestionSchema);
