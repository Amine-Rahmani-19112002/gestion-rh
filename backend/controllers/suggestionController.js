const Suggestion = require('../models/Suggestion');

exports.getSuggestions = async (req, res) => {
  try {
    const suggestions = await Suggestion.find()
      .populate('auteur', 'name email')
      .populate('commentaires.auteur', 'name email')
      .sort({ votesCount: -1, createdAt: -1 });
    res.status(200).json(suggestions);
  } catch (error) {
    console.error('Erreur getSuggestions:', error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

exports.createSuggestion = async (req, res) => {
  try {
    const { titre, description, categorie } = req.body;
    const newSuggestion = new Suggestion({
      titre,
      description,
      categorie,
      auteur: req.user._id,
      auteurNom: req.user.name,
      votes: [req.user._id],
      votesCount: 1
    });
    const saved = await newSuggestion.save();
    res.status(201).json(saved);
  } catch (error) {
    console.error('Erreur createSuggestion:', error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

exports.voteSuggestion = async (req, res) => {
  try {
    const suggestion = await Suggestion.findById(req.params.id);
    if (!suggestion) {
      return res.status(404).json({ message: 'Suggestion non trouvée.' });
    }

    const hasVoted = suggestion.votes.includes(req.user._id);
    if (hasVoted) {
      suggestion.votes = suggestion.votes.filter(id => id.toString() !== req.user._id.toString());
      suggestion.votesCount -= 1;
    } else {
      suggestion.votes.push(req.user._id);
      suggestion.votesCount += 1;
    }

    await suggestion.save();
    res.status(200).json(suggestion);
  } catch (error) {
    console.error('Erreur voteSuggestion:', error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

exports.addComment = async (req, res) => {
  try {
    const { texte } = req.body;
    const suggestion = await Suggestion.findById(req.params.id);
    if (!suggestion) {
      return res.status(404).json({ message: 'Suggestion non trouvée.' });
    }

    suggestion.commentaires.push({
      auteur: req.user._id,
      auteurNom: req.user.name,
      texte
    });
    suggestion.commentairesCount += 1;
    
    await suggestion.save();
    res.status(201).json(suggestion);
  } catch (error) {
    console.error('Erreur addComment:', error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

exports.updateSuggestion = async (req, res) => {
  try {
    const suggestion = await Suggestion.findById(req.params.id);
    if (!suggestion) {
      return res.status(404).json({ message: 'Suggestion non trouvée.' });
    }

    // Admin updates
    if (req.user.role === 'admin') {
      const { statut, reponseAdmin, priorite } = req.body;
      if (statut) suggestion.statut = statut;
      if (reponseAdmin !== undefined) suggestion.reponseAdmin = reponseAdmin;
      if (priorite) suggestion.priorite = priorite;
    } 
    // Author updates
    else if (suggestion.auteur.toString() === req.user._id.toString() && suggestion.statut === 'En cours de vote') {
      const { titre, description, categorie } = req.body;
      if (titre) suggestion.titre = titre;
      if (description) suggestion.description = description;
      if (categorie) suggestion.categorie = categorie;
    } else {
      return res.status(403).json({ message: 'Non autorisé.' });
    }

    const updated = await suggestion.save();
    res.status(200).json(updated);
  } catch (error) {
    console.error('Erreur updateSuggestion:', error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

exports.deleteSuggestion = async (req, res) => {
  try {
    const suggestion = await Suggestion.findById(req.params.id);
    if (!suggestion) {
      return res.status(404).json({ message: 'Suggestion non trouvée.' });
    }
    await suggestion.deleteOne();
    res.status(200).json({ message: 'Suggestion supprimée.' });
  } catch (error) {
    console.error('Erreur deleteSuggestion:', error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};
