const express = require('express');
const router = express.Router();
const { 
  getUserProfile, 
  getUserQuestions, 
  getUserAnswers,
  getLeaderboard
} = require('../controllers/userController');

router.get('/leaderboard', getLeaderboard);
router.get('/:id', getUserProfile);
router.get('/:id/questions', getUserQuestions);
router.get('/:id/answers', getUserAnswers);

module.exports = router;
