const express = require('express');
const router = express.Router();
const { sendEmailReminder } = require('../controllers/emailController');

router.post('/send/:clientId', sendEmailReminder);

module.exports = router;