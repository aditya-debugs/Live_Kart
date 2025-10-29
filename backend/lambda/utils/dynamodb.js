// DynamoDB Helper Functions for LiveKart Lambda Functions

const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
  UpdateCommand,
  DeleteCommand,
  ScanCommand,
  QueryCommand,
} = require("@aws-sdk/lib-dynamodb");

const REGION = process.env.AWS_REGION || "us-east-1";
const PRODUCTS_TABLE = process.env.PRODUCTS_TABLE || "livekart-products";
const ORDERS_TABLE = process.env.ORDERS_TABLE || "livekart-orders";

// Create DynamoDB client
const client = new DynamoDBClient({ region: REGION });
const ddbDoc = DynamoDBDocumentClient.from(client);

/**
 * Put item in DynamoDB
 */
async function putItem(tableName, item) {
  const command = new PutCommand({
    TableName: tableName,
    Item: item,
  });
  return await ddbDoc.send(command);
}

/**
 * Get item from DynamoDB
 */
async function getItem(tableName, key) {
  const command = new GetCommand({
    TableName: tableName,
    Key: key,
  });
  const result = await ddbDoc.send(command);
  return result.Item;
}

/**
 * Update item in DynamoDB
 */
async function updateItem(tableName, key, updateExpression, expressionValues) {
  const command = new UpdateCommand({
    TableName: tableName,
    Key: key,
    UpdateExpression: updateExpression,
    ExpressionAttributeValues: expressionValues,
    ReturnValues: "ALL_NEW",
  });
  const result = await ddbDoc.send(command);
  return result.Attributes;
}

/**
 * Delete item from DynamoDB
 */
async function deleteItem(tableName, key) {
  const command = new DeleteCommand({
    TableName: tableName,
    Key: key,
  });
  return await ddbDoc.send(command);
}

/**
 * Scan table (use for small datasets or with filters)
 */
async function scanTable(
  tableName,
  filterExpression = null,
  expressionValues = null
) {
  const params = {
    TableName: tableName,
  };

  if (filterExpression) {
    params.FilterExpression = filterExpression;
    params.ExpressionAttributeValues = expressionValues;
  }

  const command = new ScanCommand(params);
  const result = await ddbDoc.send(command);
  return result.Items;
}

/**
 * Query table with index
 */
async function queryTable(
  tableName,
  keyConditionExpression,
  expressionValues,
  indexName = null
) {
  const params = {
    TableName: tableName,
    KeyConditionExpression: keyConditionExpression,
    ExpressionAttributeValues: expressionValues,
  };

  if (indexName) {
    params.IndexName = indexName;
  }

  const command = new QueryCommand(params);
  const result = await ddbDoc.send(command);
  return result.Items;
}

/**
 * Increment a counter (e.g., product views)
 */
async function incrementCounter(tableName, key, attributeName) {
  const command = new UpdateCommand({
    TableName: tableName,
    Key: key,
    UpdateExpression: `ADD ${attributeName} :inc`,
    ExpressionAttributeValues: {
      ":inc": 1,
    },
    ReturnValues: "UPDATED_NEW",
  });
  const result = await ddbDoc.send(command);
  return result.Attributes;
}

module.exports = {
  PRODUCTS_TABLE,
  ORDERS_TABLE,
  putItem,
  getItem,
  updateItem,
  deleteItem,
  scanTable,
  queryTable,
  incrementCounter,
};
