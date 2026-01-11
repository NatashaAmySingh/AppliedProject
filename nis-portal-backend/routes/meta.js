const express = require('express');
const router = express.Router();
const controller = require('../controllers/metaController');

router.get('/countries', controller.getCountries);
router.get('/benefit-types', controller.getBenefitTypes);

module.exports = router;
