// Clean DynamoDB schema for Loquat 2.0 - matching table structure
import { 
  DynamoDBClient, 
  GetItemCommand, 
  PutItemCommand, 
  ScanCommand, 
  QueryCommand
} from '@aws-sdk/client-dynamodb';
import { v4 as uuidv4 } from 'uuid';

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
      savedPins: data.Item.savedPins ? JSON.parse(data.Item.savedPins.S) : []
    };
  } catch (err) {
    console.error('Error getting user:', err);
    return null;
  }
}

async function saveUser(user) {
  const params = {
    TableName: USERS_TABLE,
    Item: {
      userName: { S: user.userName },
      savedPins: { S: JSON.stringify(user.savedPins || []) }
    }
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

export { getUser, saveUser, createPin, getAllPins, getPinById };
