const aws = require('./aws');

exports.saveInDynamoDb = async (item_data, tableName) => {

    // Set up the params object for the DDB call
    const dynamoDbParams = buildDynamoDbParams(item_data, tableName);
    console.log(`dynamoDbParams: ${JSON.stringify(dynamoDbParams, null, 2)}`)

    // Push batch to dynamodb
    try {
        const result = await aws.batchWrite(dynamoDbParams)
        console.log('Success: ', result)
    } catch (err) {
        console.error('Error: ', err)
    }
};

const buildDynamoDbParams = (item_data, tableName) => {
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