const express = require('express');
const router = express.Router();
const {
  getCompanies,
  getCompanyById,
  registerCompany,
  addCompanyHealthPlan,
  removeCompanyHealthPlan,
  updatePaymentStatus
} = require('../controllers/companyController');
const { authenticateToken } = require('../middleware/auth');

// Cadastro de empresa é público
router.post('/register', registerCompany);

// Rotas autenticadas
router.get('/', authenticateToken, getCompanies);
router.get('/:id', authenticateToken, getCompanyById);
router.post('/:id/health-plans', authenticateToken, addCompanyHealthPlan);
router.delete('/health-plans/:relationId', authenticateToken, removeCompanyHealthPlan);
router.put('/:id/payment', authenticateToken, updatePaymentStatus);

module.exports = router;
