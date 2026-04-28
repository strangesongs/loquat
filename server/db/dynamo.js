import { DynamoDBClient } from '@aws-sdk/client-dynamodb';

export const REGION = process.env.AWS_REGION || 'us-west-2';
export const USERS_TABLE =
  process.env.DYNAMODB_USERS_TABLE || process.env.DYNAMODB_TABLE || 'LoquatUsers';
export const PINS_TABLE = process.env.PINS_TABLE || 'LoquatPins';

export const dynamoClient = new DynamoDBClient({ region: REGION });
