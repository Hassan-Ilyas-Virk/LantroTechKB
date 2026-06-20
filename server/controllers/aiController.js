const Question = require('../models/Question');
const Answer = require('../models/Answer');
const aiService = require('../services/aiService');

// @desc    Generate knowledge gap analysis
// @route   GET /api/ai/knowledge-gaps
// @access  Private/Admin
exports.getKnowledgeGaps = async (req, res, next) => {
  try {
    // Get unanswered or low-voted questions to analyze gaps
    const problemQuestions = await Question.find({ status: 'open' })
      .sort('-views')
      .limit(30)
      .select('title body tags answersCount')
      .populate('tags', 'name');

    const analysis = await aiService.analyzeKnowledgeGaps(problemQuestions);
    res.json(analysis);
  } catch (error) {
    next(error);
  }
};

// @desc    Generate Auto-FAQ
// @route   GET /api/ai/auto-faq
// @access  Private/Admin
exports.getAutoFAQ = async (req, res, next) => {
  try {
    // Get highly upvoted and resolved questions
    const topQuestions = await Question.find({ status: 'resolved' })
      .sort('-views')
      .limit(20)
      .populate('acceptedAnswer', 'body');

    const qnaPairs = topQuestions.map(q => ({
      question: q.title,
      answer: q.acceptedAnswer ? q.acceptedAnswer.body : 'No accepted answer'
    }));

    const faq = await aiService.generateAutoFAQ(qnaPairs);
    res.json(faq);
  } catch (error) {
    next(error);
  }
};

// @desc    Get trending topics
// @route   GET /api/ai/trending-topics
// @access  Private/Admin
exports.getTrendingTopics = async (req, res, next) => {
  try {
    // Get questions from last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentQuestions = await Question.find({ createdAt: { $gte: thirtyDaysAgo } })
      .select('title body')
      .limit(50);

    const trends = await aiService.detectTrendingTopics(recentQuestions);
    res.json(trends);
  } catch (error) {
    next(error);
  }
};

// @desc    Verify an answer using AI
// @route   POST /api/ai/verify-answer
// @access  Private/Admin
exports.verifyAnswer = async (req, res, next) => {
  try {
    const { answerId } = req.body;
    
    const answer = await Answer.findById(answerId).populate('question');
    if (!answer) {
      return res.status(404).json({ message: 'Answer not found' });
    }

    const verificationResult = await aiService.verifyAnswer(answer.question, answer.body);
    
    // Update answer with AI verification status
    answer.aiVerification = {
      status: verificationResult.status,
      confidence: verificationResult.confidence,
      feedback: verificationResult.feedback,
      suggestedCorrection: verificationResult.suggestedCorrection,
      verifiedAt: Date.now()
    };
    
    await answer.save();

    res.json(answer.aiVerification);
  } catch (error) {
    next(error);
  }
};
