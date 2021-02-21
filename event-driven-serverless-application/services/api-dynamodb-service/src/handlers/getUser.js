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
        const result = await dynamodb.get(params);
        if (result.Item) {
            return response.success(result.Item);
        } else {
            return response.failure({ status: false, error: "Item not found." });
        }
    } catch (e) {
        return response.failure({ status: false });
    }
};