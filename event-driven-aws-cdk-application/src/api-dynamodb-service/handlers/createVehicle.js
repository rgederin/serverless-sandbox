'use strict';

const dynamodb = require('aws-sdk/clients/dynamodb');
const docClient = new dynamodb.DocumentClient();

// Get the DynamoDB table name from environment variables
const tableName = process.env.DYNAMODB_TABLE;

module.exports.handler = async event => {
    if (event.httpMethod !== 'POST') {
        throw new Error(`postMethod only accepts POST method, you tried: ${event.httpMethod} method.`);
    }

    console.info('test');
    console.info('received:', event);

    const params = buildDynamoDbParams(event);
    await docClient.put(params).promise();

    const response = {
        statusCode: 200,
        body: JSON.stringify(params.Item)
    };

    console.info(`response from: ${event.path} statusCode: ${response.statusCode} body: ${response.body}`);
    return response;
};

const buildDynamoDbParams = event => {
    const data = JSON.parse(event.body);

    return {
        TableName: tableName,
        Item: {
            id: '_' + Math.random().toString(36).substr(2, 9),
            vehicle_brand: data.vehicle_brand,
            vehicle_model: data.vehicle_model,
            vehicle_year: data.vehicle_year,
            createdAt: new Date().getTime(),
            updatedAt: new Date().getTime()
        }
    };
};