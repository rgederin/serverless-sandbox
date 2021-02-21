const dynamodb = require('../utils/dynamodb');
const response = require('../utils/response');

module.exports.main = async event => {
    const dynamoDbParameters = {
        TableName: process.env.DYNAMODB_TABLE
    };

    try {
        const result = await dynamodb.scan(dynamoDbParameters);
        return response.success(result.Items);
    } catch (e) {
        console.log(e);
        return response.failure({ status: false });
    }
};