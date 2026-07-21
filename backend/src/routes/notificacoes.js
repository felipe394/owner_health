const express = require('express');
const router = express.Router();
const notificacaoController = require('../controllers/notificacaoController');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

router.get('/', notificacaoController.getNotificacoes);
router.put('/bulk/lida', notificacaoController.bulkMarkAsRead);
router.delete('/bulk', notificacaoController.bulkDelete);
router.put('/:id/lida', notificacaoController.markAsRead);
router.delete('/:id', notificacaoController.deleteNotificacao);

module.exports = router;
