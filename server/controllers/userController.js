const User = require('../models/User');
const Question = require('../models/Question');
const Answer = require('../models/Answer');

// @desc    Get user profile
// @route   GET /api/users/:id
// @access  Public
exports.getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's questions
// @route   GET /api/users/:id/questions
// @access  Public
exports.getUserQuestions = async (req, res, next) => {
  try {
    const questions = await Question.find({ author: req.params.id })
      .populate('tags', 'name color')
      .sort('-createdAt');

    res.json(questions);
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's answers
// @route   GET /api/users/:id/answers
// @access  Public
exports.getUserAnswers = async (req, res, next) => {
  try {
    const answers = await Answer.find({ author: req.params.id })
      .populate({
        path: 'question',
        select: 'title status acceptedAnswer views voteCount createdAt'
      })
      .sort('-createdAt');

    res.json(answers);
  } catch (error) {
    next(error);
  }
};

// @desc    Get top contributors
// @route   GET /api/users/leaderboard
// @access  Public
exports.getLeaderboard = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 10;
    
    const users = await User.find()
      .select('name avatar department reputation answersCount questionsCount')
      .sort('-reputation -answersCount')
      .limit(limit);

    res.json(users);
  } catch (error) {
    next(error);
  }
};
