'use strict';

const dynamodb = require('aws-sdk/clients/dynamodb');

const docClient = new dynamodb.DocumentClient();
const tableName = process.env.DYNAMODB_TABLE;

module.exports.handler = async event => {
    if (event.httpMethod !== 'DELETE') {
        throw new Error(`delete method only accept DELETE method, you tried: ${event.httpMethod}`);
    }

    console.info('received:', event);
    await docClient.delete(buildDynamoDbParams(event)).promise();

    const response = {
        statusCode: 200,
        body: JSON.stringify('resource deleted')
    };

    console.info(`response from: ${event.path} statusCode: ${response.statusCode} body: ${response.body}`);
    return response;
};

const buildDynamoDbParams = event => {
    return {
        TableName: tableName,
        Key: {
            id: event.pathParameters.vehicle_id
        }
    };
};