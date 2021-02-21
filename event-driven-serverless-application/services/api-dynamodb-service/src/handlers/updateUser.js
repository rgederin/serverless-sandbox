const response = require('../utils/response');
const dynamoDb = require('../utils/dynamoDb');

module.exports.main = async event => {
    console.log("updateUser lambda event: ", event);

    const dynamoDbParameters = buildDynamoDbParams(event);
    try {
        await dynamoDb.update(dynamoDbParameters);
        return response.success({ status: true });
    } catch (e) {
        console.log("error: ", e);
        return response.failure({ status: false });
    }
};

const buildDynamoDbParams = event => {
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