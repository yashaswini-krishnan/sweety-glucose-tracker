const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { daily, monthToDate, monthly } = require('../controllers/reportsController');

const router = express.Router();

router.use(requireAuth);
router.get('/daily', daily);
router.get('/month-to-date', monthToDate);
router.get('/monthly', monthly);

module.exports = router;
