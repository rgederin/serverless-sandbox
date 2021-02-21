const dynamodb = require('../utils/dynamodb');
const response = require('../utils/response');

module.exports.main = async event => {
    const params = {
        TableName: process.env.DYNAMODB_TABLE,
        Key: {
            id: event.pathParameters.id
        }
    };

    try {
        await dynamodb.delete(params);
        return response.success({ status: true });
    } catch (e) {
        return response.failure({ status: false });
    }
};