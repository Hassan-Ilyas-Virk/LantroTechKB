const Question = require('../models/Question');
const User = require('../models/User');
const Tag = require('../models/Tag');

// @desc    Get all questions
// @route   GET /api/questions
// @access  Public
exports.getQuestions = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    
    let query = {};

    // Search query
    if (req.query.search) {
      query.$text = { $search: req.query.search };
    }

    // Filter by tag
    if (req.query.tag) {
      query.tags = req.query.tag;
    }

    // Filter by status
    if (req.query.status) {
      query.status = req.query.status;
    }

    // Unanswered only
    if (req.query.unanswered === 'true') {
      query.answersCount = 0;
    }

    let mongooseQuery = Question.find(query)
      .populate('author', 'name avatar department')
      .populate('tags', 'name color');

    // Sorting
    let sortStr = '-isPinned -createdAt'; // Default sort
    if (req.query.sort) {
      if (req.query.sort === 'popular') {
        sortStr = '-isPinned -views -voteCount';
      } else if (req.query.sort === 'oldest') {
        sortStr = '-isPinned createdAt';
      }
    }
    
    mongooseQuery = mongooseQuery.sort(sortStr);

    // Pagination setup
    const total = await Question.countDocuments(query);
    const questions = await mongooseQuery.skip(startIndex).limit(limit);

    res.json({
      success: true,
      count: questions.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: questions
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single question
// @route   GET /api/questions/:id
// @access  Public
exports.getQuestion = async (req, res, next) => {
  try {
    const question = await Question.findById(req.params.id)
      .populate('author', 'name avatar department reputation')
      .populate('tags', 'name color')
      .populate('acceptedAnswer');

    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    // Increment views
    question.views += 1;
    await question.save({ validateBeforeSave: false });

    res.json(question);
  } catch (error) {
    next(error);
  }
};

// @desc    Create new question
// @route   POST /api/questions
// @access  Private
exports.createQuestion = async (req, res, next) => {
  try {
    req.body.author = req.user.id;

    const question = await Question.create(req.body);

    // Update tags count
    if (req.body.tags && req.body.tags.length > 0) {
      await Tag.updateMany(
        { _id: { $in: req.body.tags } },
        { $inc: { questionsCount: 1 } }
      );
    }

    // Update user questions count
    await User.findByIdAndUpdate(req.user.id, {
      $inc: { questionsCount: 1 }
    });

    const populatedQuestion = await Question.findById(question._id)
      .populate('author', 'name avatar department')
      .populate('tags', 'name color');

    res.status(201).json(populatedQuestion);
  } catch (error) {
    next(error);
  }
};

// @desc    Update question
// @route   PUT /api/questions/:id
// @access  Private
exports.updateQuestion = async (req, res, next) => {
  try {
    let question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    // Make sure user is question author or admin
    if (question.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this question' });
    }

    // Handle tag count updates if tags changed
    if (req.body.tags && JSON.stringify(question.tags) !== JSON.stringify(req.body.tags)) {
      // Decrement old tags
      await Tag.updateMany(
        { _id: { $in: question.tags } },
        { $inc: { questionsCount: -1 } }
      );
      // Increment new tags
      await Tag.updateMany(
        { _id: { $in: req.body.tags } },
        { $inc: { questionsCount: 1 } }
      );
    }

    question = await Question.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate('tags', 'name color');

    res.json(question);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete question
// @route   DELETE /api/questions/:id
// @access  Private
exports.deleteQuestion = async (req, res, next) => {
  try {
    const question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    // Make sure user is question author or admin
    if (question.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this question' });
    }

    // Decrement tag counts
    if (question.tags && question.tags.length > 0) {
      await Tag.updateMany(
        { _id: { $in: question.tags } },
        { $inc: { questionsCount: -1 } }
      );
    }

    // Decrement user count
    await User.findByIdAndUpdate(question.author, {
      $inc: { questionsCount: -1 }
    });

    await question.deleteOne();

    res.json({ message: 'Question removed' });
  } catch (error) {
    next(error);
  }
};

// @desc    Vote on question
// @route   POST /api/questions/:id/vote
// @access  Private
exports.voteQuestion = async (req, res, next) => {
  try {
    const { type } = req.body; // 'upvote' or 'downvote'
    const question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    const userId = req.user.id;
    
    // Remove existing votes
    const hasUpvoted = question.upvotes.includes(userId);
    const hasDownvoted = question.downvotes.includes(userId);

    if (hasUpvoted) question.upvotes.pull(userId);
    if (hasDownvoted) question.downvotes.pull(userId);

    let reputationChange = 0;

    // Apply new vote
    if (type === 'upvote' && !hasUpvoted) {
      question.upvotes.push(userId);
      reputationChange = 5; // Question author gains 5 rep
    } else if (type === 'downvote' && !hasDownvoted) {
      question.downvotes.push(userId);
      reputationChange = -2; // Question author loses 2 rep
    }
    
    // Reverse previous reputation effect
    if (hasUpvoted && type !== 'upvote') reputationChange -= 5;
    if (hasDownvoted && type !== 'downvote') reputationChange += 2;

    await question.save();

    // Update author's reputation
    if (reputationChange !== 0 && question.author.toString() !== userId) {
      await User.findByIdAndUpdate(question.author, {
        $inc: { reputation: reputationChange }
      });
    }

    res.json({
      upvotes: question.upvotes,
      downvotes: question.downvotes,
      voteCount: question.upvotes.length - question.downvotes.length
    });
  } catch (error) {
    next(error);
  }
};
