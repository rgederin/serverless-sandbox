const AWS = require('aws-sdk');

AWS.config.region = process.env.REGION;

const s3 = new AWS.S3();
const sqs = new AWS.SQS({ apiVersion: '2012-11-05' });

module.exports = {
    getObject: (params) => s3.getObject(params).promise(),
    sendMessage: (params) => sqs.sendMessage(params).promise()
};