const Tag = require('../models/Tag');

// @desc    Get all tags
// @route   GET /api/tags
// @access  Public
exports.getTags = async (req, res, next) => {
  try {
    let query = {};
    
    if (req.query.category) {
      query.category = req.query.category;
    }

    if (req.query.search) {
      query.name = { $regex: req.query.search, $options: 'i' };
    }

    const sort = req.query.sort === 'alphabetical' ? 'name' : '-questionsCount';

    const tags = await Tag.find(query).sort(sort);

    res.json(tags);
  } catch (error) {
    next(error);
  }
};

// @desc    Create a tag
// @route   POST /api/tags
// @access  Private
exports.createTag = async (req, res, next) => {
  try {
    const { name, description, category, color } = req.body;

    const tagExists = await Tag.findOne({ name: name.toLowerCase() });
    if (tagExists) {
      return res.status(400).json({ message: 'Tag already exists' });
    }

    // Only admins can create official tags
    const isOfficial = req.user.role === 'admin';

    const tag = await Tag.create({
      name,
      description,
      category,
      color,
      isOfficial,
      createdBy: req.user.id
    });

    res.status(201).json(tag);
  } catch (error) {
    next(error);
  }
};

// @desc    Update a tag
// @route   PUT /api/tags/:id
// @access  Private/Admin
exports.updateTag = async (req, res, next) => {
  try {
    const tag = await Tag.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!tag) {
      return res.status(404).json({ message: 'Tag not found' });
    }

    res.json(tag);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a tag
// @route   DELETE /api/tags/:id
// @access  Private/Admin
exports.deleteTag = async (req, res, next) => {
  try {
    const tag = await Tag.findById(req.params.id);

    if (!tag) {
      return res.status(404).json({ message: 'Tag not found' });
    }

    await tag.deleteOne();

    res.json({ message: 'Tag removed' });
  } catch (error) {
    next(error);
  }
};
