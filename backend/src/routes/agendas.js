const express = require('express');
const router = express.Router();
const agendaController = require('../controllers/agendaController');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

router.post('/', agendaController.createAgenda);
router.get('/', agendaController.getAgendas);
router.put('/:id', agendaController.updateAgenda);
router.post('/:id/book', agendaController.bookAgenda);
router.delete('/:id', agendaController.deleteAgenda);

module.exports = router;
