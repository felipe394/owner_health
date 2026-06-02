const express = require('express');
const router = express.Router();
const { getUsers, registerSystemUser, deleteSystemUser } = require('../controllers/userController');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

router.get('/', getUsers);
router.post('/register', registerSystemUser);
router.delete('/:id', deleteSystemUser);

module.exports = router;
