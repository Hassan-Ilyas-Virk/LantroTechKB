const Answer = require('../models/Answer');
const Question = require('../models/Question');
const User = require('../models/User');

// @desc    Get answers for a question
// @route   GET /api/questions/:questionId/answers
// @access  Public
exports.getAnswers = async (req, res, next) => {
  try {
    const answers = await Answer.find({ question: req.params.questionId })
      .populate('author', 'name avatar department reputation role')
      .sort('-isAccepted -isOfficial -isPinned -voteCount createdAt');

    res.json(answers);
  } catch (error) {
    next(error);
  }
};

// @desc    Add answer to question
// @route   POST /api/questions/:questionId/answers
// @access  Private
exports.createAnswer = async (req, res, next) => {
  try {
    const question = await Question.findById(req.params.questionId);

    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    const answer = await Answer.create({
      body: req.body.body,
      author: req.user.id,
      question: req.params.questionId
    });

    // Increment question answer count
    question.answersCount += 1;
    await question.save({ validateBeforeSave: false });

    // Increment user answer count
    await User.findByIdAndUpdate(req.user.id, {
      $inc: { answersCount: 1 }
    });

    // (Optional) Here we could trigger async AI verification

    const populatedAnswer = await Answer.findById(answer._id)
      .populate('author', 'name avatar department reputation role');

    res.status(201).json(populatedAnswer);
  } catch (error) {
    next(error);
  }
};

// @desc    Update answer
// @route   PUT /api/answers/:id
// @access  Private
exports.updateAnswer = async (req, res, next) => {
  try {
    let answer = await Answer.findById(req.params.id);

    if (!answer) {
      return res.status(404).json({ message: 'Answer not found' });
    }

    if (answer.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this answer' });
    }

    answer = await Answer.findByIdAndUpdate(
      req.params.id, 
      { body: req.body.body }, 
      { new: true, runValidators: true }
    ).populate('author', 'name avatar department reputation role');

    res.json(answer);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete answer
// @route   DELETE /api/answers/:id
// @access  Private
exports.deleteAnswer = async (req, res, next) => {
  try {
    const answer = await Answer.findById(req.params.id);

    if (!answer) {
      return res.status(404).json({ message: 'Answer not found' });
    }

    if (answer.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this answer' });
    }

    const questionId = answer.question;

    await answer.deleteOne();

    // Decrement question answer count
    await Question.findByIdAndUpdate(questionId, {
      $inc: { answersCount: -1 }
    });

    // Decrement user answer count
    await User.findByIdAndUpdate(answer.author, {
      $inc: { answersCount: -1 }
    });

    res.json({ message: 'Answer removed' });
  } catch (error) {
    next(error);
  }
};

// @desc    Vote on answer
// @route   POST /api/answers/:id/vote
// @access  Private
exports.voteAnswer = async (req, res, next) => {
  try {
    const { type } = req.body;
    const answer = await Answer.findById(req.params.id);

    if (!answer) {
      return res.status(404).json({ message: 'Answer not found' });
    }

    const userId = req.user.id;
    
    const hasUpvoted = answer.upvotes.includes(userId);
    const hasDownvoted = answer.downvotes.includes(userId);

    if (hasUpvoted) answer.upvotes.pull(userId);
    if (hasDownvoted) answer.downvotes.pull(userId);

    let reputationChange = 0;

    if (type === 'upvote' && !hasUpvoted) {
      answer.upvotes.push(userId);
      reputationChange = 10; // Answer upvote gives 10 rep
    } else if (type === 'downvote' && !hasDownvoted) {
      answer.downvotes.push(userId);
      reputationChange = -2;
    }
    
    if (hasUpvoted && type !== 'upvote') reputationChange -= 10;
    if (hasDownvoted && type !== 'downvote') reputationChange += 2;

    await answer.save();

    if (reputationChange !== 0 && answer.author.toString() !== userId) {
      await User.findByIdAndUpdate(answer.author, {
        $inc: { reputation: reputationChange }
      });
    }

    res.json({
      upvotes: answer.upvotes,
      downvotes: answer.downvotes,
      voteCount: answer.upvotes.length - answer.downvotes.length
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Accept answer
// @route   PUT /api/answers/:id/accept
// @access  Private
exports.acceptAnswer = async (req, res, next) => {
  try {
    const answer = await Answer.findById(req.params.id);
    if (!answer) {
      return res.status(404).json({ message: 'Answer not found' });
    }

    const question = await Question.findById(answer.question);
    
    if (question.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to accept answer' });
    }

    // Unaccept previous answer if exists
    if (question.acceptedAnswer) {
      await Answer.findByIdAndUpdate(question.acceptedAnswer, { isAccepted: false });
      // Remove reputation from previous accepted author
      const prevAnswer = await Answer.findById(question.acceptedAnswer);
      if (prevAnswer) {
        await User.findByIdAndUpdate(prevAnswer.author, { $inc: { reputation: -15 } });
      }
    }

    // Toggle accept
    if (question.acceptedAnswer?.toString() === req.params.id) {
      // Unaccepting
      question.acceptedAnswer = null;
      question.status = 'open';
      answer.isAccepted = false;
      await User.findByIdAndUpdate(answer.author, { $inc: { reputation: -15 } });
    } else {
      // Accepting
      question.acceptedAnswer = answer._id;
      question.status = 'resolved';
      answer.isAccepted = true;
      await User.findByIdAndUpdate(answer.author, { $inc: { reputation: 15 } }); // 15 rep for accepted answer
    }

    await question.save();
    await answer.save();

    res.json(answer);
  } catch (error) {
    next(error);
  }
};

// @desc    Mark answer as official (Admin only)
// @route   PUT /api/answers/:id/official
// @access  Private/Admin
exports.markOfficial = async (req, res, next) => {
  try {
    const answer = await Answer.findById(req.params.id);
    if (!answer) {
      return res.status(404).json({ message: 'Answer not found' });
    }

    answer.isOfficial = !answer.isOfficial;
    await answer.save();

    res.json(answer);
  } catch (error) {
    next(error);
  }
};

// @desc    Pin answer (Admin only)
// @route   PUT /api/answers/:id/pin
// @access  Private/Admin
exports.pinAnswer = async (req, res, next) => {
  try {
    const answer = await Answer.findById(req.params.id);
    if (!answer) {
      return res.status(404).json({ message: 'Answer not found' });
    }

    answer.isPinned = !answer.isPinned;
    await answer.save();

    res.json(answer);
  } catch (error) {
    next(error);
  }
};
