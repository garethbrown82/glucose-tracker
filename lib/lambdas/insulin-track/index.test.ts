import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

import { handler, InsulinEvent, InsulinEventRequestBody } from './index';

jest.mock('@aws-sdk/client-dynamodb');
jest.mock('@aws-sdk/lib-dynamodb');

describe('insulin-track handler', () => {
  (DynamoDBClient as jest.Mock).mockImplementation(() => ({}));

  const mockSend = jest.fn();
  const mockDynamoDB = {
    send: mockSend,
  } as unknown as DynamoDBDocumentClient

  DynamoDBDocumentClient.from = () => mockDynamoDB;

  it('correctly calls send', async () => {
        const requestBody: InsulinEventRequestBody = {
          type: 'Lantus',
          units: 10,
        };

        const insulinEvent: InsulinEvent = {
          body: JSON.stringify(requestBody),
        };

        const response = await handler(insulinEvent);

        expect(mockSend).toHaveBeenCalled();
  });

  it('returns a response', async () => {
    const requestBody: InsulinEventRequestBody = {
      type: 'Lantus',
      units: 10,
    };

    const insulinEvent: InsulinEvent = {
      body: JSON.stringify(requestBody),
    };

    const response = await handler(insulinEvent);

    expect(response.statusCode).toEqual(200);
  });
});