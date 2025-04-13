const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const History = require('../models/History');
const { check, validationResult } = require('express-validator');

// @route   GET /api/history
// @desc    Get history with filters
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const {
      type = 'all',
      startDate,
      endDate,
      search,
      status = 'all',
      page = 1,
      limit = 10
    } = req.query;

    // Build filter query
    const query = { userId: req.user.id };

    // Type filter
    if (type !== 'all') {
      query.type = type;
    }

    // Date range filter
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) {
        const endDateTime = new Date(endDate);
        endDateTime.setHours(23, 59, 59, 999);
        query.createdAt.$lte = endDateTime;
      }
    }

    // Status filter
    if (status !== 'all') {
      query.status = status;
    }

    // Search filter
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { 'clientDetails.name': { $regex: search, $options: 'i' } },
        { 'clientDetails.email': { $regex: search, $options: 'i' } },
        { 'clientDetails.phone': { $regex: search, $options: 'i' } }
      ];
    }

    // Calculate pagination
    const skip = (page - 1) * parseInt(limit);
    const limitNum = parseInt(limit);

    // Get total count for pagination
    const total = await History.countDocuments(query);

    // Log the query for debugging
    // console.log('History Query:', query);

    // Fetch history items with populated client data
    const items = await History.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate('clientId', 'name email phone');

    // Log the response for debugging
    // console.log('History Response:', {
    //   totalItems: total,
    //   currentPage: page,
    //   itemsPerPage: limitNum,
    //   itemsReturned: items.length
    // });

    res.json({
      items,
      total,
      perPage: limitNum,
      page: parseInt(page),
      totalPages: Math.ceil(total / limitNum)
    });

  } catch (error) {
    console.error('Error in history route:', error);
    res.status(500).json({ 
      message: 'Error fetching history',
      error: error.message 
    });
  }
});

// @route   DELETE /api/history/:id
// @desc    Delete a history entry
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const history = await History.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!history) {
      return res.status(404).json({ message: 'History entry not found' });
    }

    await history.remove();
    res.json({ message: 'History entry removed' });
  } catch (error) {
    console.error('Error deleting history:', error);
    res.status(500).json({ message: 'Error deleting history entry' });
  }
});

// @route   GET /api/history/:id
// @desc    Get a single history entry by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const history = await History.findOne({
      _id: req.params.id,
      userId: req.user.id
    }).populate('clientId', 'name email phone');

    if (!history) {
      return res.status(404).json({ message: 'History entry not found' });
    }

    res.json(history);
  } catch (error) {
    console.error('Error fetching history entry:', error);
    res.status(500).json({ message: 'Error fetching history entry' });
  }
});

module.exports = router;
