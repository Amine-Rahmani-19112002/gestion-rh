const express = require('express');
const router = express.Router();
const {
  getContracts,
  getContract,
  createContract,
  updateContract,
  deleteContract,
  getContractStats,
} = require('../controllers/contractController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getContracts)
  .post(protect, adminOnly, createContract);

router.route('/stats')
  .get(protect, adminOnly, getContractStats);

router.route('/:id')
  .get(protect, getContract)
  .put(protect, adminOnly, updateContract)
  .delete(protect, adminOnly, deleteContract);

module.exports = router;
