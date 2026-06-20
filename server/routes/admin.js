const express = require('express');
const router = express.Router();
const { 
  getDashboardStats,
  getUnresolvedQuestions
} = require('../controllers/adminController');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

// All admin routes are protected by auth AND admin middleware
router.use(auth, admin);

router.get('/dashboard', getDashboardStats);
router.get('/unresolved', getUnresolvedQuestions);

module.exports = router;
