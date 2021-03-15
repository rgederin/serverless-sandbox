'use strict';

const AWS = require('aws-sdk');
const s3 = new AWS.S3();
const sqs = new AWS.SQS();

const queueUrl = process.env.QUEUE_URL;
const BATCH_SIZE = 25;


module.exports.handler = async event => {
    console.log("processS3Bucket lambda event: ", event);

    await Promise.all(
        event.Records.map(async (record) => {
            try {
                // Get original text from object in incoming event
                const originalText = await s3.getObject(buildS3Params(record)).promise();
                console.log('original text: ', originalText);

                //Convert to json format
                const jsonData = JSON.parse(originalText.Body.toString('utf-8'));

                console.log('json: ', jsonData);

                //Split to batches (25 items in the batch)
                const batches = splitToBatches(jsonData);

                //Send batches to SQS
                await sendToSqs(batches);
            } catch (err) {
                console.error(err);
            }
        })
    );
};

const splitToBatches = data => {
    // Split data into batches for upload
    let batches = [];

    while (data.length > 0) {
        batches.push(data.splice(0, BATCH_SIZE));
    }
    console.log(`total batches: ${batches.length}`);

    return batches;
};

const sendToSqs = async (batches) => {
    let batchCount = 0;

    // Save each batch
    await Promise.all(
        batches.map(async (itemData) => {
            const items = [];

            itemData.forEach(item => {
                for (let key of Object.keys(item)) {
                    // An AttributeValue may not contain an empty string
                    if (item[key] === '')
                        delete item[key];
                }

                // Build params
                items.push({
                    id: '_' + Math.random().toString(36).substr(2, 9),
                    ...item
                });
            });

            // Push to SQS in batches
            try {
                batchCount++;
                console.log('trying batch: ', batchCount);
                const result = await sqs.sendMessage(buildSQSParams(items)).promise();
                console.log('success: ', result);
            } catch (err) {
                console.error('error: ', err);
            }
        })
    );
};

const buildS3Params = record => {
    return {
        Bucket: record.s3.bucket.name,
        Key: record.s3.object.key
    };
};

const buildSQSParams = (items) => {
    return {
        MessageBody: JSON.stringify(items),
        QueueUrl: queueUrl
    };
};

