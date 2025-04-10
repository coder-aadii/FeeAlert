router.get('/api/clients', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 7;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';

    // Build query
    let query = {};
    if (search) {
      query = {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { phone: { $regex: search, $options: 'i' } }
        ]
      };
    }

    // Get total count based on search criteria
    const total = await Client.countDocuments(query);

    // Get paginated clients with search
    const clients = await Client.find(query)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    // Return response with pagination metadata
    res.json({
      clients,
      total,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      hasMore: page < Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Error fetching clients:', error);
    res.status(500).json({ 
      message: 'Failed to fetch clients', 
      error: error.message 
    });
  }
});
