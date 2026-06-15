const express = require('express');
const router = express.Router();
const { authenticate, forgotPassword, resetPassword } = require('../controllers/authController');

router.post('/authenticate', authenticate);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

module.exports = router;
