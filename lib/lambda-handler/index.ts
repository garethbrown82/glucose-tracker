import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";


export const handler = async (event: any = {}) => {
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
