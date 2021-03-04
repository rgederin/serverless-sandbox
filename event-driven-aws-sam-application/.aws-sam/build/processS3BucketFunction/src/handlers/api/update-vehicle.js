// Create clients and set shared const values outside of the handler.

// Create a DocumentClient that represents the query to add an item
const dynamodb = require('aws-sdk/clients/dynamodb');
const docClient = new dynamodb.DocumentClient();

// Get the DynamoDB table name from environment variables
const tableName = process.env.DYNAMODB_TABLE;

/**
 * A simple example includes a HTTP post method to add one item to a DynamoDB table.
 */
exports.handler = async (event) => {
    if (event.httpMethod !== 'PUT') {
        throw new Error(`put method only accepts PUT method, you tried: ${event.httpMethod} method.`);
    }
    // All log statements are written to CloudWatch
    console.info('received:', event);

    // Creates a new item, or replaces an old item with a new item
    // https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB/DocumentClient.html#put-property
    var params = buildDynamoDbParams(event);

    const result = await docClient.update(params).promise();

    const response = {
        statusCode: 200,
        body: JSON.stringify('resource updated')
    };

    // All log statements are written to CloudWatch
    console.info(`response from: ${event.path} statusCode: ${response.statusCode} body: ${response.body}`);
    return response;
}


const buildDynamoDbParams = event => {
    const data = JSON.parse(event.body);

    return {
        TableName: tableName,
        Key: {
            id: event.pathParameters.id
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