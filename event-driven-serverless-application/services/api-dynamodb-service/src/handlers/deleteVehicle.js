const dynamoDb = require('../utils/dynamoDb');
const response = require('../utils/response');

module.exports.main = async event => {
    console.log("deleteVehicle lambda event: ", event);

    const dynamoDbParameters = buildDynamoDbParams(event);
    try {
        await dynamoDb.delete(dynamoDbParameters);
        return response.success({ status: true });
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
};
