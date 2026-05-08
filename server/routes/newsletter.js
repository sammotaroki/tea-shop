const express = require('express');
const router = express.Router();

router.post('/', (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ success: false, message: 'A valid email is required' });
    }
    // TODO: integrate with Mailchimp / SendGrid when ready
    res.status(200).json({ success: true, message: 'Subscribed successfully' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
