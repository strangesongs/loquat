
// DynamoDB-based data store for users and pins
const { DynamoDBClient, GetItemCommand, PutItemCommand } = require('@aws-sdk/client-dynamodb');

const REGION = process.env.AWS_REGION || 'us-west-2';
const TABLE_NAME = process.env.DYNAMODB_TABLE || 'LoquatUsers';
const client = new DynamoDBClient({ region: REGION });

async function getUser(userName) {
  const params = {
    TableName: TABLE_NAME,
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
    return null;
  }
}

async function saveUser(user) {
  const params = {
    TableName: TABLE_NAME,
    Item: {
      userName: { S: user.userName },
      savedPins: { S: JSON.stringify(user.savedPins || []) }
    }
  };
  try {
    await client.send(new PutItemCommand(params));
    return true;
  } catch (err) {
    return false;
  }
}

module.exports = {
  getUser,
  saveUser
};
