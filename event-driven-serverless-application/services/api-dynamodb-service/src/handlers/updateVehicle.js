const response = require('../utils/response');
const dynamoDb = require('../utils/dynamoDb');

module.exports.main = async event => {
    console.log("updateVehicle lambda event: ", event);

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
            ":vehicle_brand": data.vehicle_brand,
            ":vehicle_model": data.vehicle_model,
            ":vehicle_year": data.vehicle_year,
            ":updatedAt": new Date().getTime()
        },
        UpdateExpression:
            "SET vehicle_brand = :vehicle_brand, vehicle_model = :vehicle_model, vehicle_year = :vehicle_year, updatedAt = :updatedAt",
        ReturnValues: "ALL_NEW"
    };
};