const express = require('express');
const router = express.Router();
const { sendSMSReminder } = require('../controllers/smsController');

router.post('/send/:clientId', sendSMSReminder);

module.exports = router;