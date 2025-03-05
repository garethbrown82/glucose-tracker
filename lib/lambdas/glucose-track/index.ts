import { S3Handler } from 'aws-lambda';
import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { parse } from 'csv-parse/sync';

export const handler: S3Handler = async (event, context) => {
  // console.log(`EVENT: \n ${JSON.stringify(event, null, 2)}`);
  const client = new S3Client({});
  const record = event.Records[0];

  try {
    const response = await client.send(
      new GetObjectCommand({
        Bucket: record.s3.bucket.name,
        Key: record.s3.object.key,
      })
    );

    const fileContents = await response.Body?.transformToString();
    if (!fileContents) {
      throw new Error('The fileContents is undefined');
    }

    const records = parse(fileContents, {
      from_line: 2,
      columns: true,
      skip_empty_lines: true,

    }) as object[];

    console.log('records: ', JSON.stringify(records));
  } catch (error) {
    console.error(`Error when trying to retrieve object with key ${record.s3.object.key} from bucket name ${record.s3.bucket.name}: `, JSON.stringify(error));
  }
};
