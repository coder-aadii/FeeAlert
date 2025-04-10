const express = require('express');
const router = express.Router();
const clientController = require('../controllers/clientController');
const authController = require('../controllers/authController');

// Protect all routes
router.use(authController.protect);

router.route('/')
  .get(clientController.getClients)
  .post(clientController.addClient);

router.route('/:id')
  .put(clientController.updateClient)
  .delete(clientController.deleteClient);

module.exports = router;