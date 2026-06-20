const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

// Load env vars
dotenv.config({ path: '../.env' });

const User = require('../models/User');
const Question = require('../models/Question');
const Answer = require('../models/Answer');
const Tag = require('../models/Tag');

// Connect to DB
mongoose.connect(process.env.MONGODB_URI);

const seedDatabase = async () => {
  try {
    console.log('Clearing old data...');
    await User.deleteMany();
    await Question.deleteMany();
    await Answer.deleteMany();
    await Tag.deleteMany();

    console.log('Creating users...');
    const salt = await bcrypt.genSalt(10);
    const adminPassword = await bcrypt.hash('admin123', salt);
    const userPassword = await bcrypt.hash('password123', salt);

    const users = await User.insertMany([
      { name: 'Admin User', email: 'admin@lantrotech.com', password: adminPassword, role: 'admin', department: 'Management' },
      { name: 'Sarah Jenkins', email: 'sarah@lantrotech.com', password: userPassword, role: 'employee', department: 'Engineering' },
      { name: 'Michael Chen', email: 'michael@lantrotech.com', password: userPassword, role: 'employee', department: 'DevOps' },
      { name: 'Emily Rodriguez', email: 'emily@lantrotech.com', password: userPassword, role: 'employee', department: 'HR' },
      { name: 'David Smith', email: 'david@lantrotech.com', password: userPassword, role: 'employee', department: 'Frontend' }
    ]);

    const admin = users[0];
    const sarah = users[1];
    const michael = users[2];
    const emily = users[3];
    const david = users[4];

    console.log('Creating tags...');
    const tags = await Tag.insertMany([
      { name: 'react', category: 'technical', isOfficial: true, createdBy: admin._id, color: '#61dafb' },
      { name: 'node.js', category: 'technical', isOfficial: true, createdBy: admin._id, color: '#339933' },
      { name: 'docker', category: 'technical', isOfficial: true, createdBy: admin._id, color: '#2496ed' },
      { name: 'onboarding', category: 'hr', isOfficial: true, createdBy: admin._id, color: '#f59e0b' },
      { name: 'benefits', category: 'hr', isOfficial: true, createdBy: admin._id, color: '#10b981' },
      { name: 'ci-cd', category: 'process', isOfficial: true, createdBy: admin._id, color: '#8b5cf6' }
    ]);

    const reactTag = tags[0];
    const nodeTag = tags[1];
    const dockerTag = tags[2];
    const onboardTag = tags[3];

    console.log('Creating questions...');
    const questions = await Question.insertMany([
      {
        title: 'How do I set up the local Docker environment for the main API?',
        body: 'I am getting a port conflict error when trying to run `docker-compose up`. Is there documentation on which ports need to be free?',
        author: sarah._id,
        tags: [dockerTag._id],
        views: 45,
        status: 'resolved'
      },
      {
        title: 'What is the process for requesting PTO in the new HR system?',
        body: 'The old portal is down and the new one does not seem to have a PTO request button on the dashboard.',
        author: michael._id,
        tags: [onboardTag._id, tags[4]._id],
        views: 120,
        status: 'resolved'
      },
      {
        title: 'Best practices for React state management in our new micro-frontend?',
        body: 'Should we stick to Context API or are we migrating to Zustand as discussed in the last all-hands?',
        author: david._id,
        tags: [reactTag._id],
        views: 22,
        status: 'open'
      }
    ]);

    console.log('Creating answers...');
    const ans1 = await Answer.create({
      body: 'You need to make sure port 5432 (Postgres) and 6379 (Redis) are free on your host machine. If you have local instances running, stop them first using `sudo service postgresql stop`.',
      author: michael._id,
      question: questions[0]._id,
      upvotes: [sarah._id, david._id],
      isAccepted: true
    });

    const ans2 = await Answer.create({
      body: 'The PTO requests have moved under "My Profile" > "Time Off" in the new Workday portal. It is not on the main dashboard anymore.',
      author: emily._id,
      question: questions[1]._id,
      upvotes: [michael._id, sarah._id, david._id, admin._id],
      isAccepted: true,
      isOfficial: true
    });

    // Update relations
    await Question.findByIdAndUpdate(questions[0]._id, { acceptedAnswer: ans1._id, answersCount: 1, upvotes: [michael._id] });
    await Question.findByIdAndUpdate(questions[1]._id, { acceptedAnswer: ans2._id, answersCount: 1 });
    
    // Update Tag counts
    await Tag.findByIdAndUpdate(dockerTag._id, { questionsCount: 1 });
    await Tag.findByIdAndUpdate(onboardTag._id, { questionsCount: 1 });
    await Tag.findByIdAndUpdate(tags[4]._id, { questionsCount: 1 });
    await Tag.findByIdAndUpdate(reactTag._id, { questionsCount: 1 });

    // Update User counts
    await User.findByIdAndUpdate(sarah._id, { questionsCount: 1 });
    await User.findByIdAndUpdate(michael._id, { questionsCount: 1, answersCount: 1, reputation: 25 });
    await User.findByIdAndUpdate(david._id, { questionsCount: 1 });
    await User.findByIdAndUpdate(emily._id, { answersCount: 1, reputation: 45 });

    console.log('Database Seeded Successfully!');
    process.exit();
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedDatabase();
