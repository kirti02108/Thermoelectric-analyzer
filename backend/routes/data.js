const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');

router.post('/save-calculation', auth, async (req, res) => {
  try {
    const { userId, inputs, outputs, chartData } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.calculations.push({ inputs, outputs, chartData });
    await user.save();
    res.status(201).json({ message: 'Calculation saved' });
  } catch (error) {
    res.status(500).json({ message: 'Error saving calculation', error: error.message });
  }
});

router.post('/save-tlm', auth, async (req, res) => {
  try {
    const { userId, inputs, outputs, chartData } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.tlmCalculations.push({ inputs, outputs, chartData, date: new Date() });
    await user.save();
    res.status(201).json({ message: 'TLM analysis saved' });
  } catch (error) {
    res.status(500).json({ message: 'Error saving TLM analysis', error: error.message });
  }
});

router.get('/history/:userId', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({
      calculations: user.calculations || [],
      tlmCalculations: user.tlmCalculations || []
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching history', error: error.message });
  }
});

module.exports = router;
