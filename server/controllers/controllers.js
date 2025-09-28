
const db = require('../schemas/schemas');
const controller = {};

// Get user data (or create new user if not found)
controller.getUser = async (req, res) => {
  const { userName } = req.body;
  let user = await db.getUser(userName);
  if (!user) {
    user = { userName, savedPins: [] };
    await db.saveUser(user);
  }
  res.json(user);
};

// Simple login: just accept username, no password
controller.loginUser = async (req, res) => {
  const { userName } = req.body;
  let user = await db.getUser(userName);
  if (!user) {
    user = { userName, savedPins: [] };
    await db.saveUser(user);
  }
  // In a real app, set a session/cookie here
  res.json({ success: true, user });
};

// Save pins for user
controller.saveButton = async (req, res) => {
  const { userName, pins } = req.body;
  let user = await db.getUser(userName);
  if (!user) {
    user = { userName, savedPins: [] };
  }
  user.savedPins = pins;
  await db.saveUser(user);
  res.json({ success: true });
};

module.exports = controller;
