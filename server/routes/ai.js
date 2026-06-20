const express = require('express');
const router = express.Router();
const { 
  getKnowledgeGaps,
  getAutoFAQ,
  getTrendingTopics,
  verifyAnswer
} = require('../controllers/aiController');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

// Apply auth to all AI routes
router.use(auth);

// Admin-only routes
router.get('/knowledge-gaps', admin, getKnowledgeGaps);
router.get('/auto-faq', admin, getAutoFAQ);
router.get('/trending-topics', admin, getTrendingTopics);

// Any authenticated user can trigger answer verification
router.post('/verify-answer', verifyAnswer);

module.exports = router;
