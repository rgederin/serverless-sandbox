const response = require('../utils/response');
const dynamodb = require('../utils/dynamodb');

module.exports.main = async event => {
    const dynamoDbParameters = buildParams(event);

    try {
        await dynamodb.update(dynamoDbParameters);
        return response.success({ status: true });
    } catch (e) {
        return response.failure({ status: false });
    }
};

const buildParams = event => {
    const data = JSON.parse(event.body);

    return {
        TableName: process.env.DYNAMODB_TABLE,
        Key: {
            id: event.pathParameters.id
        },
        ExpressionAttributeValues: {
            ":email": data.email,
            ":firstName": data.firstName,
            ":lastName": data.lastName,
            ":checked": data.checked,
            ":updatedAt": new Date().getTime()
        },
        UpdateExpression:
            "SET email = :email, firstName = :firstName, lastName = :lastName, updatedAt = :updatedAt",
        ReturnValues: "ALL_NEW"
    };
};