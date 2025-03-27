const express = require('express');
const router = express.Router();
const memberController = require('../controllers/memberController');
const authController = require('../controllers/authController');

// Protect all routes
router.use(authController.protect);

router.route('/')
  .get(memberController.getMembers)
  .post(memberController.addMember);

router.route('/:id')
  .put(memberController.updateMember)
  .delete(memberController.deleteMember);

module.exports = router;