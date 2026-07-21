const express = require('express');
const router = express.Router();
const { 
  createPatientRequest,
  createCustomPatientRequest,
  getClientRequests,
  getRequestForm,
  getRequestAnswers,
  submitClientAnswers 
} = require('../controllers/patientAnamnesisController');

router.post('/empresa/:empresa_id/request', createPatientRequest);
router.post('/empresa/:empresa_id/request/custom', createCustomPatientRequest);
router.get('/client/:cliente_id/requests', getClientRequests);
// Rota que o frontend usa
router.get('/request/:request_id/form', getRequestForm);
router.get('/request/:request_id/answers', getRequestAnswers);
// Rota legada
router.get('/requests/:request_id', getRequestForm);
router.post('/request/:request_id/submit', submitClientAnswers);
router.post('/requests/:request_id/submit', submitClientAnswers);

module.exports = router;
