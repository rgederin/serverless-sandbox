'use strict';

const dynamodb = require('aws-sdk/clients/dynamodb');

const docClient = new dynamodb.DocumentClient();
const tableName = process.env.DYNAMODB_TABLE;

module.exports.handler = async event => {
    if (event.httpMethod !== 'PUT') {
        throw new Error(`put method only accepts PUT method, you tried: ${event.httpMethod} method.`);
    }

    console.info('received:', event);

    await docClient.update(buildDynamoDbParams(event)).promise();

    const response = {
        statusCode: 200,
        body: JSON.stringify('resource updated')
    };

    console.info(`response from: ${event.path} statusCode: ${response.statusCode} body: ${response.body}`);
    return response;
};

const buildDynamoDbParams = event => {
    const data = JSON.parse(event.body);

    return {
        TableName: tableName,
        Key: {
            id: event.pathParameters.vehicle_id
        },
        ExpressionAttributeValues: {
            ":vehicle_brand": data.vehicle_brand,
            ":vehicle_model": data.vehicle_model,
            ":vehicle_year": data.vehicle_year,
            ":updatedAt": new Date().getTime()
        },
        UpdateExpression:
            "SET vehicle_brand = :vehicle_brand, vehicle_model = :vehicle_model, vehicle_year = :vehicle_year, updatedAt = :updatedAt",
        ReturnValues: "ALL_NEW"
    };
};