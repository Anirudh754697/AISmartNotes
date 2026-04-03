const User = require('../models/User');

const aiRateLimit = async (req, res, next) => {
  try {
    const uid = req.user.uid;
    const limit = parseInt(process.env.AI_DAILY_LIMIT) || 20;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let user = await User.findOne({ uid });
    if (!user) {
      user = await User.create({ uid, email: req.user.email });
    }

    // Reset counter if it's a new day
    if (!user.lastRequestDate || user.lastRequestDate < today) {
      user.dailyAiRequests = 0;
      user.lastRequestDate = today;
    }

    if (user.dailyAiRequests >= limit) {
      return res.status(429).json({
        error: `Daily AI request limit (${limit}) reached. Try again tomorrow.`,
        limit,
        used: user.dailyAiRequests,
      });
    }

    user.dailyAiRequests += 1;
    await user.save();

    req.aiUsage = { used: user.dailyAiRequests, limit };
    next();
  } catch (err) {
    console.error('Rate limit error:', err);
    next(); // Don't block on rate limit errors
  }
};

module.exports = aiRateLimit;
