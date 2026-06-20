const Question = require('../models/Question');
const Answer = require('../models/Answer');
const User = require('../models/User');

// @desc    Get dashboard statistics
// @route   GET /api/admin/dashboard
// @access  Private/Admin
exports.getDashboardStats = async (req, res, next) => {
  try {
    const totalQuestions = await Question.countDocuments();
    const totalAnswers = await Answer.countDocuments();
    const totalUsers = await User.countDocuments();

    const openQuestions = await Question.countDocuments({ status: 'open' });
    const resolvedQuestions = await Question.countDocuments({ status: 'resolved' });
    
    // Aggregation for questions by department
    const questionsByDept = await Question.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'author',
          foreignField: '_id',
          as: 'authorDetails'
        }
      },
      { $unwind: '$authorDetails' },
      {
        $group: {
          _id: '$authorDetails.department',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      totals: {
        questions: totalQuestions,
        answers: totalAnswers,
        users: totalUsers
      },
      status: {
        open: openQuestions,
        resolved: resolvedQuestions,
        resolutionRate: totalQuestions ? ((resolvedQuestions / totalQuestions) * 100).toFixed(1) : 0
      },
      departments: questionsByDept
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get unresolved questions
// @route   GET /api/admin/unresolved
// @access  Private/Admin
exports.getUnresolvedQuestions = async (req, res, next) => {
  try {
    const questions = await Question.find({ status: 'open' })
      .populate('author', 'name department')
      .populate('tags', 'name color')
      .sort('createdAt') // Oldest first
      .limit(50);
      
    res.json(questions);
  } catch (error) {
    next(error);
  }
};
