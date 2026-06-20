const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  body: {
    type: String,
    required: [true, 'Answer body is required'],
    maxlength: [10000, 'Answer cannot exceed 10000 characters']
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  question: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question',
    required: true
  },
  upvotes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  downvotes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  isAccepted: {
    type: Boolean,
    default: false
  },
  isPinned: {
    type: Boolean,
    default: false
  },
  isOfficial: {
    type: Boolean,
    default: false
  },
  aiVerification: {
    status: {
      type: String,
      enum: ['pending', 'verified', 'flagged', 'corrected', 'none'],
      default: 'none'
    },
    confidence: {
      type: Number,
      min: 0,
      max: 100,
      default: null
    },
    feedback: {
      type: String,
      default: ''
    },
    suggestedCorrection: {
      type: String,
      default: ''
    },
    verifiedAt: {
      type: Date,
      default: null
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for vote count
answerSchema.virtual('voteCount').get(function() {
  return (this.upvotes ? this.upvotes.length : 0) - (this.downvotes ? this.downvotes.length : 0);
});

answerSchema.index({ question: 1, createdAt: -1 });
answerSchema.index({ author: 1 });
answerSchema.index({ isAccepted: -1 });
answerSchema.index({ 'aiVerification.status': 1 });

module.exports = mongoose.model('Answer', answerSchema);
