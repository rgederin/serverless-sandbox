const dynamoDb = require('../utils/dynamoDb');
const response = require('../utils/response');

module.exports.main = async event => {
    console.log("getUser lambda event: ", event);

    const dynamoDbParameters = buildDynamoDbParams(event);
    try {
        const result = await dynamoDb.get(dynamoDbParameters);
        if (result.Item) {
            return response.success(result.Item);
        } else {
            return response.failure({ status: false, error: "Item not found." });
        }
    } catch (e) {
        console.log("error: ", e);
        return response.failure({ status: false });
    }
};

const buildDynamoDbParams = event => {
    return {
        TableName: process.env.DYNAMODB_TABLE,
        Key: {
            id: event.pathParameters.id
        }
    };
}
