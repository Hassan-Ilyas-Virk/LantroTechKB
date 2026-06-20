const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { 
  getQuestions, 
  getQuestion, 
  createQuestion, 
  updateQuestion, 
  deleteQuestion, 
  voteQuestion 
} = require('../controllers/questionController');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');

// Include other resource routers
const answerRouter = require('./answers');

// Re-route into other resource routers
router.use('/:questionId/answers', answerRouter);

const questionValidation = [
  body('title').trim().notEmpty().withMessage('Title is required').isLength({ max: 200 }),
  body('body').trim().notEmpty().withMessage('Body is required'),
  body('tags').optional().isArray()
];

const voteValidation = [
  body('type').isIn(['upvote', 'downvote']).withMessage('Vote type must be upvote or downvote')
];

router.route('/')
  .get(getQuestions)
  .post(auth, questionValidation, validate, createQuestion);

router.route('/:id')
  .get(getQuestion)
  .put(auth, questionValidation, validate, updateQuestion)
  .delete(auth, deleteQuestion);

router.post('/:id/vote', auth, voteValidation, validate, voteQuestion);

module.exports = router;
