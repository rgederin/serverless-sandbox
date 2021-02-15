'use strict';

const AWS = require('aws-sdk');
AWS.config.region = process.env.REGION;
const s3 = new AWS.S3();
const sqs = new AWS.SQS({ apiVersion: '2012-11-05' });
const { v4: uuidv4 } = require('uuid');
const BATCH_SIZE = 25;

module.exports.s3processor = async (event) => {
  console.log("s3 event: ", JSON.stringify(event, null, 2));
  console.log("sqs queue URL: ", process.env.QUEUE_URL);

  await Promise.all(
    event.Records.map(async (record) => {
      try {
        // Get original text from object in incoming event
        const originalText = await s3.getObject({
          Bucket: record.s3.bucket.name,
          Key: record.s3.object.key
        }).promise();

        // Upload JSON to DynamoDB
        const jsonData = JSON.parse(originalText.Body.toString('utf-8'));
        const batches = splitToBatches(jsonData);

        await sendToSQS(batches);
      } catch (err) {
        console.error(err);
      }
    })
  );
};

const splitToBatches = data => {
  // Split into batches for upload
  let batches = [];

  while (data.length > 0) {
    batches.push(data.splice(0, BATCH_SIZE));
  }
  console.log(`total batches: ${batches.length}`);

  return batches;
};

// Send batches to SQS
const sendToSQS = async (batches) => {
  let batchCount = 0;

  // Save each batch
  await Promise.all(
    batches.map(async (item_data) => {
      const items = [];

      item_data.forEach(item => {
        for (let key of Object.keys(item)) {
          // An AttributeValue may not contain an empty string
          if (item[key] === '')
            delete item[key];
        }

        // Build params
        items.push({
          ID: uuidv4(),
          ...item
        });
      });

      // Params object for SQS
      const params = {
        MessageBody: JSON.stringify(items),
        QueueUrl: process.env.QUEUE_URL
      };

      // Push to SQS in batches
      try {
        batchCount++;
        console.log('trying batch: ', batchCount);
        const result = await sqs.sendMessage(params).promise();
        console.log('success: ', result);
      } catch (err) {
        console.error('error: ', err);
      }
    })
  )
}

