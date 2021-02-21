const uuid = require('uuid');
const response = require('../utils/response');
const dynamodb = require('../utils/dynamodb');

module.exports.main = async event => {
    const dynamoDbParameters = buildParams(event);

    try {
        await dynamodb.put(dynamoDbParameters);
        return response.success(params.Item);
    } catch (e) {
        console.log(e);
        return response.failure({ status: false });
    }
};

const buildParams = event => {
    const data = JSON.parse(event.body);

    return params = {
        TableName: process.env.DYNAMODB_TABLE,
        Item: {
            id: uuid.v4(),
            email: data.email,
            firstName: data.firstName,
            lastName: data.lastName,
            createdAt: new Date().getTime(),
            updatedAt: new Date().getTime()
        }
    };
};