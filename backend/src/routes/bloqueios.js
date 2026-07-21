const express = require('express');
const router = express.Router();
const bloqueioController = require('../controllers/bloqueioController');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

router.get('/', bloqueioController.listarBloqueios);
router.post('/fechar', bloqueioController.fecharMes);
router.post('/:id/abrir', bloqueioController.abrirMes);
router.put('/solicitacoes/:id', bloqueioController.responderSolicitacao);

module.exports = router;
