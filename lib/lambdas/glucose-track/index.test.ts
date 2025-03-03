import { Context } from 'aws-lambda';

import { handler } from './index';

describe('glucose-track lambda', () => {
  it('returns the correct response', async () => {
    const event = {};
    const context = { logStreamName: 'test-log-stream' } as Context;
    const response = await handler(event, context, () => {});
    expect(response).toEqual('test-log-stream');
  });
});