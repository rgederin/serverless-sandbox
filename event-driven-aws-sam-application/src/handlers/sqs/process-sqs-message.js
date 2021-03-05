const dynamodb = require('aws-sdk/clients/dynamodb');
const docClient = new dynamodb.DocumentClient();

// Get the DynamoDB table name from environment variables
const tableName = process.env.DYNAMODB_TABLE;

/**
 * A Lambda function that 'listen' sqs and store batches of data in dynamodb
 */
exports.handler = async (event, context) => {

    console.log("processSqsMessage lambda event: ", event);

    await Promise.all(
        event.Records.map(async (event) => {
            const items = JSON.parse(event.body);
            console.log(JSON.stringify(items, null, 2));
            await saveInDynamoDb(items);
        })
    );
};

const saveInDynamoDb = async (item_data) => {
    // Set up the params object for the DDB call
    const dynamoDbParams = buildDynamoDbParams(item_data);
    console.log(`dynamoDbParams: ${JSON.stringify(dynamoDbParams, null, 2)}`)

    // Push batch to dynamodb
    try {
        const result = await docClient.batchWrite(dynamoDbParams).promise();
        console.log('Success: ', result)
    } catch (err) {
        console.error('Error: ', err)
    }
};

const buildDynamoDbParams = (item_data) => {
    const dynamoDbParams = {
        RequestItems: {}
    };

    dynamoDbParams.RequestItems[tableName] = [];

    item_data.forEach(item => {
        for (let key of Object.keys(item)) {
            // An AttributeValue may not contain an empty string
            if (item[key] === '')
                delete item[key]
        }

        // Build params
        dynamoDbParams.RequestItems[tableName].push({
            PutRequest: {
                Item: {
                    ...item
                }
            }
        })
    });

    return dynamoDbParams;
};
