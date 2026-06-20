const express = require('express');
// mergeParams required to access :questionId from question routes if we nested them
const router = express.Router({ mergeParams: true }); 
const { body } = require('express-validator');
const { 
  getAnswers, 
  createAnswer, 
  updateAnswer, 
  deleteAnswer, 
  voteAnswer,
  acceptAnswer,
  markOfficial,
  pinAnswer
} = require('../controllers/answerController');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const validate = require('../middleware/validate');

const answerValidation = [
  body('body').trim().notEmpty().withMessage('Answer body is required')
];

const voteValidation = [
  body('type').isIn(['upvote', 'downvote']).withMessage('Vote type must be upvote or downvote')
];

// These routes usually mounted at /api/questions/:questionId/answers and /api/answers
router.route('/')
  .get(getAnswers)
  .post(auth, answerValidation, validate, createAnswer);

router.route('/:id')
  .put(auth, answerValidation, validate, updateAnswer)
  .delete(auth, deleteAnswer);

router.post('/:id/vote', auth, voteValidation, validate, voteAnswer);
router.put('/:id/accept', auth, acceptAnswer);

// Admin routes
router.put('/:id/official', auth, admin, markOfficial);
router.put('/:id/pin', auth, admin, pinAnswer);

module.exports = router;
