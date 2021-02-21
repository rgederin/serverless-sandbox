const AWS = require('aws-sdk');

const client = new AWS.DynamoDB.DocumentClient();

module.exports = {
    get: (params) => client.get(params).promise(),
    scan: (params) => client.scan(params).promise(),
    put: (params) => client.put(params).promise(),
    query: (params) => client.query(params).promise(),
    update: (params) => client.update(params).promise(),
    delete: (params) => client.delete(params).promise(),
};