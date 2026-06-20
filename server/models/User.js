const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  role: {
    type: String,
    enum: ['employee', 'admin'],
    default: 'employee'
  },
  department: {
    type: String,
    enum: ['Engineering', 'HR', 'DevOps', 'Frontend', 'Backend', 'Design', 'QA', 'Management', 'Marketing', 'Support'],
    default: 'Engineering'
  },
  avatar: {
    type: String,
    default: ''
  },
  reputation: {
    type: Number,
    default: 0
  },
  questionsCount: {
    type: Number,
    default: 0
  },
  answersCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Generate avatar from initials
userSchema.pre('save', function(next) {
  if (!this.avatar) {
    const initials = this.name.split(' ').map(n => n[0]).join('').toUpperCase();
    this.avatar = initials;
  }
  next();
});

// Indexes
userSchema.index({ role: 1 });
userSchema.index({ reputation: -1 });

module.exports = mongoose.model('User', userSchema);
