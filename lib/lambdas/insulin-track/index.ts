import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";

export interface InsulinEventRequestBody {
  type: 'Lantus' | 'Novorapid';
  units: number;
}

export interface InsulinEvent {
  body: string;
}

const client = new DynamoDBClient({});
const dynamoDB = DynamoDBDocumentClient.from(client);

export const handler = async (event: InsulinEvent) => {
  const dateNow = new Date();
  const timeNow = dateNow.getTime().toString();
  const requestBody: InsulinEventRequestBody = JSON.parse(event.body);

  if (!isBodyValid(requestBody)) {
    return {
      body: JSON.stringify({ message: 'Request body is malformed' }),
      statusCode: 400,
    }
  }

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

const isBodyValid = (body: InsulinEventRequestBody) => (
  Object.keys(body).every(key => ['type', 'units'].includes(key))
)
