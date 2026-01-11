const express = require('express');
const router = express.Router();
const controller = require('../controllers/requestController');


router.post('/', controller.createRequest); // create request
router.get('/', controller.listRequests);
router.get('/:id', controller.getRequest);
router.put('/:id', controller.updateRequest);
router.patch('/:id', controller.updateRequest);

module.exports = router;
