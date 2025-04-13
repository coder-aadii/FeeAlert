const express = require('express');
const router = express.Router();

// Debug middleware
router.use((req, res, next) => {
  console.log('\n🔄 Email Route Hit:', {
    method: req.method,
    path: req.path,
    body: req.body
  });
  next();
});

// Import email controller
const { sendEmailReminder } = require('../controllers/emailController');

// Route for sending reminders (note: the path is just '/' because '/api/reminders' is already set in server.js)
router.post('/', sendEmailReminder);

module.exports = router;
