const dynamoDb = require('../utils/dynamoDb');
const response = require('../utils/response');

module.exports.main = async event => {
    console.log("getUsers lambda event: ", event);

    const dynamoDbParameters = buildDynamoDbParams(event);
    try {
        const result = await dynamoDb.scan(dynamoDbParameters);
        return response.success(result.Items);
    } catch (e) {
        console.log("error: ", e);
        return response.failure({ status: false });
    }
};

const buildDynamoDbParams = () => {
    return {
        TableName: process.env.DYNAMODB_TABLE
    };
}
