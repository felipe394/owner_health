const express = require('express');
const router = express.Router();
const { getClients, getClientById, registerClient, updateClient } = require('../controllers/clientController');
const { authenticateToken } = require('../middleware/auth');

// Cadastro de cliente é público
router.post('/register', registerClient);

// Rotas autenticadas
router.get('/', authenticateToken, getClients);
router.get('/:id', authenticateToken, getClientById);
router.put('/:id', authenticateToken, updateClient);

module.exports = router;
