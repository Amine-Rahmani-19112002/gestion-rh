const Contract = require('../models/Contract');
const Employee = require('../models/Employee');

// @desc    Get all contracts
// @route   GET /api/contracts
// @access  Private
const getContracts = async (req, res) => {
  try {
    const contracts = await Contract.find().populate('employee', 'nom prenom matricule poste departement email');
    res.status(200).json(contracts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single contract
// @route   GET /api/contracts/:id
// @access  Private
const getContract = async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.id).populate('employee', 'nom prenom matricule poste departement email');
    if (!contract) {
      return res.status(404).json({ message: 'Contract not found' });
    }
    res.status(200).json(contract);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a contract
// @route   POST /api/contracts
// @access  Private/Admin
const createContract = async (req, res) => {
  try {
    const contract = new Contract(req.body);
    const savedContract = await contract.save();
    res.status(201).json(savedContract);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update a contract
// @route   PUT /api/contracts/:id
// @access  Private/Admin
const updateContract = async (req, res) => {
  try {
    const contract = await Contract.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!contract) {
      return res.status(404).json({ message: 'Contract not found' });
    }
    res.status(200).json(contract);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete a contract
// @route   DELETE /api/contracts/:id
// @access  Private/Admin
const deleteContract = async (req, res) => {
  try {
    const contract = await Contract.findByIdAndDelete(req.params.id);
    if (!contract) {
      return res.status(404).json({ message: 'Contract not found' });
    }
    res.status(200).json({ message: 'Contract deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get contract stats
// @route   GET /api/contracts/stats
// @access  Private/Admin
const getContractStats = async (req, res) => {
  try {
    const contracts = await Contract.find();
    
    const activeContracts = contracts.filter(c => ['Actif & Signé', 'Dossier Conforme'].includes(c.statut)).length;
    
    // Simplistic CDD expiring in 30 days check
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    const expiringCdd = contracts.filter(c => 
      ['CDD', 'CDD Remplacement', 'Stage'].includes(c.typeContrat) &&
      c.dateFin &&
      new Date(c.dateFin) <= thirtyDaysFromNow &&
      new Date(c.dateFin) >= new Date()
    ).length;

    const avenantsCount = contracts.reduce((acc, c) => acc + (c.avenantsCount || 0), 0);
    
    const masseSalariale = contracts.reduce((acc, c) => acc + (c.remunerationAnnuelle || 0), 0);

    res.status(200).json({
      totalActive: activeContracts,
      expiringCdd,
      avenantsCount,
      masseSalariale
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getContracts,
  getContract,
  createContract,
  updateContract,
  deleteContract,
  getContractStats,
};
