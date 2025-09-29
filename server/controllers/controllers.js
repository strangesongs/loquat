
import * as db from '../schemas/schemas.js';
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

// Create a new pin
controller.createPin = async (req, res) => {
  const { coordinates, fruitType, notes, submittedBy } = req.body;
  
  // Validate required fields
  if (!coordinates || !coordinates.lat || !coordinates.lng || !fruitType || !submittedBy) {
    return res.status(400).json({ 
      success: false, 
      message: 'Missing required fields: coordinates, fruitType, and submittedBy are required' 
    });
  }

  // Validate coordinates are numbers
  if (typeof coordinates.lat !== 'number' || typeof coordinates.lng !== 'number') {
    return res.status(400).json({ 
      success: false, 
      message: 'Coordinates must be numbers' 
    });
  }

  // Validate notes length (max 500 words)
  if (notes && notes.split(' ').length > 500) {
    return res.status(400).json({ 
      success: false, 
      message: 'Notes cannot exceed 500 words' 
    });
  }

  try {
    const pin = await db.createPin({
      coordinates,
      fruitType: fruitType.trim(),
      notes: notes ? notes.trim() : '',
      submittedBy: submittedBy.trim()
    });

    if (pin) {
      res.json({ success: true, pin });
    } else {
      res.status(500).json({ success: false, message: 'Failed to create pin' });
    }
  } catch (error) {
    console.error('Error in createPin controller:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Get all pins
controller.getAllPins = async (req, res) => {
  try {
    const pins = await db.getAllPins();
    res.json({ success: true, pins });
  } catch (error) {
    console.error('Error in getAllPins controller:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export default controller;
