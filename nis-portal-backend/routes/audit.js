const express = require('express');
const router = express.Router();
const { logAction } = require('../controllers/auditController');

router.post('/', logAction);

module.exports = router;
