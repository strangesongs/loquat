// Clean DynamoDB schema for Loquat 2.0 - matching table structure
import { 
  DynamoDBClient, 
  GetItemCommand, 
  PutItemCommand, 
  ScanCommand, 
  QueryCommand
} from '@aws-sdk/client-dynamodb';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';

const REGION = process.env.AWS_REGION || 'us-west-2';
const USERS_TABLE = process.env.DYNAMODB_TABLE || 'LoquatUsers';
const PINS_TABLE = process.env.PINS_TABLE || 'LoquatPins';
const client = new DynamoDBClient({ region: REGION });

// Utility functions
function sanitizeString(str, maxLength = 1000) {
  if (typeof str !== 'string') return '';
  return str.trim().substring(0, maxLength);
}

function generateGeoHash(lat, lng) {
  return `${Math.round(lat * 10000)}_${Math.round(lng * 10000)}`;
}

// Password validation function
function validatePassword(password) {
  if (!password || typeof password !== 'string') {
    return { valid: false, message: 'Password is required' };
  }
  
  if (password.length < 10) {
    return { valid: false, message: 'Password must be at least 10 characters long' };
  }
  
  if (!/\d/.test(password)) {
    return { valid: false, message: 'Password must contain at least one number' };
  }
  
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one symbol' };
  }
  
  return { valid: true };
}

// Email validation function  
function validateEmail(email) {
  if (!email || typeof email !== 'string') {
    return { valid: false, message: 'Email is required' };
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { valid: false, message: 'Please enter a valid email address' };
  }
  
  return { valid: true };
}

// USER FUNCTIONS
async function getUser(userName) {
  const params = {
    TableName: USERS_TABLE,
    Key: {
      userName: { S: userName }
    }
  };
  
  try {
    const data = await client.send(new GetItemCommand(params));
    if (!data.Item) return null;
    return {
      userName: data.Item.userName.S,
      passwordHash: data.Item.passwordHash?.S || null,
      email: data.Item.email?.S || null,
      createdAt: data.Item.createdAt?.S || null,
      lastLogin: data.Item.lastLogin?.S || null,
      // Keep legacy field for migration
      savedPins: data.Item.savedPins ? JSON.parse(data.Item.savedPins.S) : []
    };
  } catch (err) {
    console.error('Error getting user:', err);
    return null;
  }
}

async function saveUser(user) {
  const item = {
    userName: { S: user.userName }
  };

  // Add optional fields if they exist
  if (user.passwordHash) item.passwordHash = { S: user.passwordHash };
  if (user.email) item.email = { S: user.email };
  if (user.createdAt) item.createdAt = { S: user.createdAt };
  if (user.lastLogin) item.lastLogin = { S: user.lastLogin };
  
  // Keep legacy field for migration
  if (user.savedPins) item.savedPins = { S: JSON.stringify(user.savedPins) };

  const params = {
    TableName: USERS_TABLE,
    Item: item
  };
  
  try {
    await client.send(new PutItemCommand(params));
    return true;
  } catch (err) {
    console.error('Error saving user:', err);
    return false;
  }
}

// PIN FUNCTIONS
async function createPin(pinData) {
  // Validation
  if (!pinData || !pinData.coordinates || !pinData.fruitType || !pinData.submittedBy) {
    throw new Error('Missing required pin data');
  }
  
  if (typeof pinData.coordinates.lat !== 'number' || typeof pinData.coordinates.lng !== 'number') {
    throw new Error('Invalid coordinates');
  }

  const now = new Date().toISOString();
  const pinId = uuidv4();
  const lat = parseFloat(pinData.coordinates.lat);
  const lng = parseFloat(pinData.coordinates.lng);
  
  const pin = {
    pinId,
    createdAt: now,
    coordinates: { lat, lng },
    fruitType: sanitizeString(pinData.fruitType).toLowerCase(),
    fruitTypeDisplay: sanitizeString(pinData.fruitType),
    notes: sanitizeString(pinData.notes || ''),
    submittedBy: sanitizeString(pinData.submittedBy),
    geoHash: generateGeoHash(lat, lng),
    status: 'active'
  };

  const params = {
    TableName: PINS_TABLE,
    Item: {
      pinId: { S: pin.pinId },
      createdAt: { S: pin.createdAt },
      coordinates: { S: JSON.stringify(pin.coordinates) },
      fruitType: { S: pin.fruitType },
      fruitTypeDisplay: { S: pin.fruitTypeDisplay },
      notes: { S: pin.notes },
      submittedBy: { S: pin.submittedBy },
      geoHash: { S: pin.geoHash },
      status: { S: pin.status }
    }
  };

  try {
    await client.send(new PutItemCommand(params));
    return pin;
  } catch (err) {
    console.error('Error creating pin:', err);
    throw new Error('Failed to create pin');
  }
}

async function getAllPins() {
  const params = {
    TableName: PINS_TABLE
  };

  try {
    const data = await client.send(new ScanCommand(params));
    if (!data.Items) return [];
    
    return data.Items.map(item => ({
      pinId: item.pinId.S,
      createdAt: item.createdAt.S,
      coordinates: JSON.parse(item.coordinates.S),
      fruitType: item.fruitType.S,
      fruitTypeDisplay: item.fruitTypeDisplay?.S || item.fruitType.S,
      notes: item.notes?.S || '',
      submittedBy: item.submittedBy.S,
      geoHash: item.geoHash?.S || '',
      status: item.status?.S || 'active'
    }));
  } catch (err) {
    console.error('Error getting pins:', err);
    return [];
  }
}

async function getPinById(pinId) {
  // Since we need both pinId and createdAt for the key, we'll scan with filter
  const params = {
    TableName: PINS_TABLE,
    FilterExpression: 'pinId = :pinId',
    ExpressionAttributeValues: {
      ':pinId': { S: pinId }
    }
  };

  try {
    const data = await client.send(new ScanCommand(params));
    if (!data.Items || data.Items.length === 0) return null;
    
    const item = data.Items[0];
    return {
      pinId: item.pinId.S,
      createdAt: item.createdAt.S,
      coordinates: JSON.parse(item.coordinates.S),
      fruitType: item.fruitType.S,
      fruitTypeDisplay: item.fruitTypeDisplay?.S || item.fruitType.S,
      notes: item.notes?.S || '',
      submittedBy: item.submittedBy.S,
      geoHash: item.geoHash?.S || '',
      status: item.status?.S || 'active'
    };
  } catch (err) {
    console.error('Error getting pin:', err);
    return null;
  }
}

// Create new user with password hashing
async function createUser(userData) {
  const { userName, password, email } = userData;
  
  // Validation
  if (!userName || typeof userName !== 'string' || userName.trim().length < 3) {
    throw new Error('Username must be at least 3 characters long');
  }
  
  if (!email || typeof email !== 'string') {
    throw new Error('Email is required');
  }
  
  if (!password || typeof password !== 'string') {
    throw new Error('Password is required');
  }
  
  // Validate email format
  const emailValidation = validateEmail(email);
  if (!emailValidation.valid) {
    throw new Error(emailValidation.message);
  }
  
  // Validate password strength
  const passwordValidation = validatePassword(password);
  if (!passwordValidation.valid) {
    throw new Error(passwordValidation.message);
  }
  
  // Check if user already exists
  const existingUser = await getUser(userName.trim());
  if (existingUser && existingUser.passwordHash) {
    throw new Error('Username already exists');
  }
  
  // Hash password
  const saltRounds = 12;
  const passwordHash = await bcrypt.hash(password, saltRounds);
  
  // Create user object
  const now = new Date().toISOString();
  const user = {
    userName: userName.trim(),
    passwordHash,
    email: email.trim().toLowerCase(),
    createdAt: now,
    lastLogin: now,
    savedPins: [] // Keep for migration compatibility
  };
  
  const success = await saveUser(user);
  if (!success) {
    throw new Error('Failed to create user');
  }
  
  // Return user without password hash
  const { passwordHash: _, ...safeUser } = user;
  return safeUser;
}

// Verify user login
async function verifyUser(userName, password) {
  if (!userName || !password) {
    throw new Error('Username and password are required');
  }
  
  const user = await getUser(userName);
  if (!user || !user.passwordHash) {
    throw new Error('Invalid username or password');
  }
  
  const isValidPassword = await bcrypt.compare(password, user.passwordHash);
  if (!isValidPassword) {
    throw new Error('Invalid username or password');
  }
  
  // Update last login
  user.lastLogin = new Date().toISOString();
  await saveUser(user);
  
  // Return user without password hash
  const { passwordHash: _, ...safeUser } = user;
  return safeUser;
}

export { 
  getUser, 
  saveUser, 
  createUser, 
  verifyUser, 
  createPin, 
  getAllPins, 
  getPinById,
  validatePassword,
  validateEmail 
};
