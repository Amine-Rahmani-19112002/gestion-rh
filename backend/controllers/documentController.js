const Document = require('../models/Document');
const Employee = require('../models/Employee');

// @desc    Get all documents
// @route   GET /api/documents
// @access  Private
const getDocuments = async (req, res) => {
  try {
    const query = {};
    if (req.query.categorie) query.categorie = req.query.categorie;
    if (req.query.statut) query.statut = req.query.statut;

    const documents = await Document.find(query).populate('employee', 'nom prenom matricule poste departement email');
    res.status(200).json(documents);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single document
// @route   GET /api/documents/:id
// @access  Private
const getDocument = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id).populate('employee', 'nom prenom matricule poste departement email');
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }
    res.status(200).json(document);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a document
// @route   POST /api/documents
// @access  Private/Admin
const createDocument = async (req, res) => {
  try {
    const document = new Document(req.body);
    const savedDocument = await document.save();
    res.status(201).json(savedDocument);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update a document
// @route   PUT /api/documents/:id
// @access  Private/Admin
const updateDocument = async (req, res) => {
  try {
    const document = await Document.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }
    res.status(200).json(document);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete a document
// @route   DELETE /api/documents/:id
// @access  Private/Admin
const deleteDocument = async (req, res) => {
  try {
    const document = await Document.findByIdAndDelete(req.params.id);
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }
    res.status(200).json({ message: 'Document deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get document stats
// @route   GET /api/documents/stats
// @access  Private/Admin
const getDocumentStats = async (req, res) => {
  try {
    const documents = await Document.find();
    
    const byCategory = documents.reduce((acc, doc) => {
      acc[doc.categorie] = (acc[doc.categorie] || 0) + 1;
      return acc;
    }, {});
    
    const alertsCount = documents.filter(doc => doc.statut === 'Expiré' || doc.statut === 'À renouveler' || doc.alerteTexte).length;
    
    const totalDocs = documents.length;
    const compliantDocs = documents.filter(doc => doc.statut === 'Conforme').length;
    const complianceRate = totalDocs === 0 ? 100 : Math.round((compliantDocs / totalDocs) * 100);

    res.status(200).json({
      byCategory,
      alertsCount,
      complianceRate
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getDocuments,
  getDocument,
  createDocument,
  updateDocument,
  deleteDocument,
  getDocumentStats,
};
