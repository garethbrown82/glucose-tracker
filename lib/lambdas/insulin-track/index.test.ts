import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";

import { handler, InsulinEvent, InsulinEventRequestBody } from './index';

jest.mock('@aws-sdk/client-dynamodb');
jest.mock('@aws-sdk/lib-dynamodb');
jest
  .useFakeTimers()
  .setSystemTime(new Date(1740405997216));

describe('insulin-track handler', () => {
  const setupTests = () => {
    (DynamoDBClient as jest.Mock).mockImplementation(() => ({}));

    process.env.INSULIN_TABLE = 'test-table';
    
    const mockSend = jest.fn();
    DynamoDBDocumentClient.from = () => ({
        send: mockSend,
      } as unknown as DynamoDBDocumentClient
    );

    const mockPutCommand = jest.fn();
    (PutCommand as unknown as jest.Mock).mockImplementation(mockPutCommand);

    return { mockSend, mockPutCommand } 
  }

  it('calls send', async () => {
    const { mockSend, mockPutCommand } = setupTests();
        const requestBody: InsulinEventRequestBody = {
          type: 'Lantus',
          units: 10,
        };

        const insulinEvent: InsulinEvent = {
          body: JSON.stringify(requestBody),
        };

        await handler(insulinEvent);

        expect(mockSend).toHaveBeenCalled();
        expect(mockPutCommand).toHaveBeenCalledWith({
          Item: {
            timestamp: '1740405997216',
            type: 'Lantus',
            units: 10,
          },
          TableName: 'test-table',
        });
  });

  it('returns a success response', async () => {
    setupTests();

    const requestBody: InsulinEventRequestBody = {
      type: 'Lantus',
      units: 10,
    };

    const insulinEvent: InsulinEvent = {
      body: JSON.stringify(requestBody),
    };

    const response = await handler(insulinEvent);

    expect(response).toEqual({
      body: JSON.stringify({ message: 'PUT DynamoDB Item for timestamp 1740405997216' }),
      statusCode: 200,
    });
  });

  it('returns a 400 error if body is malformed', async () => {
    setupTests();

    const requestBody = {
      malformedKey: 'Lantus',
      units: 10,
    };

    const insulinEvent: InsulinEvent = {
      body: JSON.stringify(requestBody),
    };

    const response = await handler(insulinEvent);

    expect(response).toEqual({
      body: JSON.stringify({ message: 'Request body is malformed' }),
      statusCode: 400,
    });
  })
});
