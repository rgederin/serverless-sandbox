const AWS = require('aws-sdk');
const uuid = require('uuid');

const sqs = new AWS.SQS();
const s3 = new AWS.S3();

const queueUrl = process.env.QUEUE_URL;
const BATCH_SIZE = 25;

/**
 * A Lambda function that logs the payload received from S3.
 */
exports.handler = async (event, context) => {

    console.log("processS3Bucket lambda event: ", event);
    console.log("queue url: ", queueUrl);

    await Promise.all(
        event.Records.map(async (record) => {
            try {
                // Get original text from object in incoming event
                const originalText = await s3.getObject(buildS3Params(record)).promise();
                console.log('original text: ', originalText);

                //Convert to json format
                const jsonData = JSON.parse(originalText.Body.toString('utf-8'));

                //Split to batches (25 items in the batch)
                const batches = splitToBatches(jsonData);

                //Send batches to SQS
                await sendToSqs(batches, process.env.QUEUE_URL);
            } catch (err) {
                console.error(err);
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

const splitToBatches = data => {
    // Split data into batches for upload
    let batches = [];

    while (data.length > 0) {
        batches.push(data.splice(0, BATCH_SIZE));
    }
    console.log(`total batches: ${batches.length}`);

    return batches;
};

const sendToSqs = async (batches, queueUrl) => {
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
                    id: uuid.v4(),
                    ...item
                });
            });

            // Push to SQS in batches
            try {
                batchCount++;
                console.log('trying batch: ', batchCount);
                const result = await sqs.sendMessage(buildSQSParams(items, queueUrl)).promise();
                console.log('success: ', result);
            } catch (err) {
                console.error('error: ', err);
            }
        })
    );
};

const buildSQSParams = (items) => {
    return {
        MessageBody: JSON.stringify(items),
        QueueUrl: queueUrl
    };
};