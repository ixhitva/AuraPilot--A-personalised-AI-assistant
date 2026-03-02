const router = require('express').Router();
const axios = require('axios');
const Chat = require('../models/Chat');
const auth = require('../middleware/auth');

router.post('/message', auth, async (req, res) => {
  try {
    const { message, history } = req.body;
    const { data } = await axios.post(`${process.env.AI_SERVICE_URL}/chat`, {
      user_id: req.user._id.toString(),
      message,
      persona: req.user.persona || 'Friendly',
      user_name: req.user.name,
      history: history || []
    });

    // Save to MongoDB
    await Chat.findOneAndUpdate(
      { userId: req.user._id },
      { $push: { messages: [
        { role: 'user', content: message },
        { role: 'assistant', content: data.reply, sentiment: data.sentiment }
      ]}},
      { upsert: true, new: true }
    );

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/history', auth, async (req, res) => {
  try {
    const chat = await Chat.findOne({ userId: req.user._id });
    res.json({ messages: chat?.messages || [] });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/history', auth, async (req, res) => {
  try {
    await Chat.findOneAndDelete({ userId: req.user._id });
    await axios.delete(`${process.env.AI_SERVICE_URL}/memory/${req.user._id}`);
    res.json({ message: 'Chat history and memory cleared' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/persona', auth, async (req, res) => {
  try {
    const { persona } = req.body;
    await req.user.updateOne({ persona });
    res.json({ message: 'Persona updated', persona });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
