const express = require('express');
const router = express.Router();
const controller = require('../controllers/userController');

router.get('/', controller.listUsers);
router.post('/', controller.createUser);
router.patch('/:id', controller.updateUser);

module.exports = router;
