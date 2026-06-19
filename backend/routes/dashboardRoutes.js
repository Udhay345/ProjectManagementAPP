const express = require('express');
const router = express.Router();
const { getDashboardStats } = require('../controllers/dashboardController');
const { protect } = require('../middleware/auth');

// Dashboard routes require auth protect
router.get('/', protect, getDashboardStats);

module.exports = router;
