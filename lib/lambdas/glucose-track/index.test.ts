import { Context, S3Event } from 'aws-lambda';

import { handler } from './index';
import * as fs from 'node:fs/promises';
import { parse } from 'csv-parse/sync';

describe('glucose-track lambda', () => {
  it('returns the correct response', async () => {
    const event = {} as S3Event;
    const context = { logStreamName: 'test-log-stream' } as Context;
    const response = await handler(event, context, () => {});
    expect(response).toEqual('test-log-stream');
  });

  it('test loads the test data', async () => {
    try {
      const fileData = await fs.readFile('lib/lambdas/glucose-track/test-data/glucose-test-data.csv', { encoding: 'utf8' });

      const records = parse(fileData, {
        from_line: 2,
        columns: true,
        skip_empty_lines: true,

      }) as object[];

      records.forEach((record, i) => {
        console.log(`Record# ${i}: ${JSON.stringify(record)}`);
      })

    } catch (error) {
      console.log(error);
    }

  });
});