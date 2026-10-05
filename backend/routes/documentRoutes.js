const express = require('express');
const router = express.Router();
const {
  getDocuments,
  getDocument,
  createDocument,
  updateDocument,
  deleteDocument,
  getDocumentStats,
} = require('../controllers/documentController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getDocuments)
  .post(protect, adminOnly, createDocument);

router.route('/stats')
  .get(protect, adminOnly, getDocumentStats);

router.route('/:id')
  .get(protect, getDocument)
  .put(protect, adminOnly, updateDocument)
  .delete(protect, adminOnly, deleteDocument);

module.exports = router;
