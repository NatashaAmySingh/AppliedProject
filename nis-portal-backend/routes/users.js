const express = require('express');
const router = express.Router();
const controller = require('../controllers/userController');
const { authenticate, requireRole } = require('../middleware/authMiddleware');

// only system admin (role_id = 1) can manage users
router.get('/', authenticate, requireRole(1), controller.listUsers);
router.post('/', authenticate, requireRole(1), controller.createUser);
router.patch('/:id', authenticate, requireRole(1), controller.updateUser);

module.exports = router;
