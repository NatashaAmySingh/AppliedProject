const express = require('express');
const router = express.Router();
const controller = require('../controllers/requestController');
const { authenticate, requireRole } = require('../middleware/authMiddleware');


router.post('/', authenticate, controller.createRequest); // create request
router.get('/', authenticate, controller.listRequests);
router.get('/:id', authenticate, controller.getRequest);
router.put('/:id', authenticate, controller.updateRequest);
router.patch('/:id', authenticate, controller.updateRequest);
// assign a request to a user (only admin or supervisor)
router.put('/:id/assign', authenticate, requireRole([1,2]), controller.assignRequest);

module.exports = router;
