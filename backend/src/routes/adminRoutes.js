const express = require('express');
const router = express.Router();
const { getDashboardSummary } = require('../controllers/adminController');
const { authenticateToken, requireRole } = require('../middleware/auth');

router.use(authenticateToken);
router.use(requireRole('admin'));

router.get('/dashboard-summary', getDashboardSummary);

module.exports = router;

