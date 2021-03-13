'use strict';

const dynamodb = require('aws-sdk/clients/dynamodb');
const docClient = new dynamodb.DocumentClient();

const tableName = process.env.DYNAMODB_TABLE;

module.exports.handler = async event => {
    if (event.httpMethod !== 'GET') {
        throw new Error(`getAllItems only accept GET method, you tried: ${event.httpMethod}`);
    }

    console.info('received:', event);

    var params = {
        TableName: tableName
    };

    const data = await docClient.scan(params).promise();

    const response = {
        statusCode: 200,
        body: JSON.stringify(data.Items)
    };

    console.info(`response from: ${event.path} statusCode: ${response.statusCode} body: ${response.body}`);
    return response;
};