const AWSXRay = require('aws-xray-sdk-core');
const AWS = AWSXRay.captureAWS(require('aws-sdk'));

const client = new AWS.DynamoDB.DocumentClient();

module.exports = {
    batchWrite: (params) => client.batchWrite(params).promise()
};