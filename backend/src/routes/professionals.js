const express = require('express');
const router = express.Router();
const {
  getProfessionals,
  getProfessionalById,
  registerProfessional,
  linkToCompany,
  unlinkFromCompany,
  addProfessionalHealthPlan,
  removeProfessionalHealthPlan
} = require('../controllers/professionalController');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

router.get('/', getProfessionals);
router.get('/:id', getProfessionalById);
router.post('/register', registerProfessional);
router.post('/:id/link-company', linkToCompany);
router.delete('/:id/unlink-company', unlinkFromCompany);
router.post('/:id/health-plans', addProfessionalHealthPlan);
router.delete('/health-plans/:relationId', removeProfessionalHealthPlan);

module.exports = router;
