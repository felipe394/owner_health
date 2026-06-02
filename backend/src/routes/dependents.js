const express = require('express');
const router = express.Router();
const { getDependentsByClient, addDependent, removeDependent } = require('../controllers/dependentController');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

router.get('/client/:clientId', getDependentsByClient);
router.post('/client/:clientId', addDependent);
router.delete('/:id', removeDependent);

module.exports = router;
