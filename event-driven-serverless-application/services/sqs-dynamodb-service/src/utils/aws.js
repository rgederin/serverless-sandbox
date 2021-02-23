const AWS = require('aws-sdk');

const client = new AWS.DynamoDB.DocumentClient();

module.exports = {
    batchWrite: (params) => client.batchWrite(params).promise()
};