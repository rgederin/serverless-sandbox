// Create clients and set shared const values outside of the handler.

// Get the DynamoDB table name from environment variables
const tableName = process.env.DYNAMODB_TABLE;

// Create a DocumentClient that represents the query to add an item
const dynamodb = require('aws-sdk/clients/dynamodb');
const docClient = new dynamodb.DocumentClient();

/**
 * A simple example includes a HTTP get method to get one item by id from a DynamoDB table.
 */
exports.handler = async (event) => {
    if (event.httpMethod !== 'DELETE') {
        throw new Error(`delete method only accept DELETE method, you tried: ${event.httpMethod}`);
    }
    // All log statements are written to CloudWatch
    console.info('received:', event);

    // Get the item from the table
    // https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB/DocumentClient.html#get-property
    var params = buildDynamoDbParams(event)

    await docClient.delete(params).promise();

    const response = {
        statusCode: 200,
        body: JSON.stringify('resource deleted')
    };
    // All log statements are written to CloudWatch
    console.info(`response from: ${event.path} statusCode: ${response.statusCode} body: ${response.body}`);
    return response;
};

const buildDynamoDbParams = event => {
    return {
        TableName: tableName,
        Key: {
            id: event.pathParameters.id
        }
    };
};