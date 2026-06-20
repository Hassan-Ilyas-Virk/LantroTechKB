const mongoose = require('mongoose');

const tagSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Tag name is required'],
    unique: true,
    lowercase: true,
    trim: true,
    maxlength: [30, 'Tag name cannot exceed 30 characters']
  },
  description: {
    type: String,
    default: '',
    maxlength: [200, 'Description cannot exceed 200 characters']
  },
  category: {
    type: String,
    enum: ['technical', 'hr', 'process', 'general'],
    default: 'general'
  },
  color: {
    type: String,
    default: '#3b82f6'
  },
  questionsCount: {
    type: Number,
    default: 0
  },
  isOfficial: {
    type: Boolean,
    default: false
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Indexes
tagSchema.index({ category: 1 });
tagSchema.index({ questionsCount: -1 });

module.exports = mongoose.model('Tag', tagSchema);
