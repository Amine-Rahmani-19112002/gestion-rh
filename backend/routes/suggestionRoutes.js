const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const {
  getSuggestions,
  createSuggestion,
  voteSuggestion,
  addComment,
  updateSuggestion,
  deleteSuggestion
} = require('../controllers/suggestionController');

router.route('/')
  .get(protect, getSuggestions)
  .post(protect, createSuggestion);

router.post('/:id/vote', protect, voteSuggestion);
router.post('/:id/comment', protect, addComment);

router.route('/:id')
  .put(protect, updateSuggestion)
  .delete(protect, adminOnly, deleteSuggestion);

module.exports = router;
