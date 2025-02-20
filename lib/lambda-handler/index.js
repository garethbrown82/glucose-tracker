const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, PutCommand } = require("@aws-sdk/lib-dynamodb");


exports.handler = async (event) => {
  const client = new DynamoDBClient({});
  const dynamoDB = DynamoDBDocumentClient.from(client);

  const dateNow = new Date();
  const timeNow = dateNow.getTime().toString();
  const requestBody = JSON.parse(event.body);

  await dynamoDB.send(
    new PutCommand({
      TableName: process.env.INSULIN_TABLE,
      Item: {
        timestamp: timeNow,
        type: requestBody.type,
        units: Number(requestBody.units),
      }
    })
  )

  return {
    body: JSON.stringify({ message: `PUT DynamoDB Item for timestamp ${timeNow}` }),
    statusCode: 200,
  };
};
