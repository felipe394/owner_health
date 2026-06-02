const express = require('express');
const router = express.Router();
const { getHealthPlans, createHealthPlan, deleteHealthPlan } = require('../controllers/healthPlanController');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

router.get('/', getHealthPlans);
router.post('/', createHealthPlan); // Idealmente restrito a Admin Master
router.delete('/:id', deleteHealthPlan);

module.exports = router;
