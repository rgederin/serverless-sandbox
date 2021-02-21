const uuid = require('uuid');
const response = require('../utils/response');
const dynamoDb = require('../utils/dynamoDb');

module.exports.main = async event => {
    console.log("createVehicle lambda event: ", event);

    const dynamoDbParameters = buildDynamoDbParams(event);
    try {
        await dynamoDb.put(dynamoDbParameters);
        return response.success(dynamoDbParameters.Item);
    } catch (e) {
        console.log("error: ", e);
        return response.failure({ status: false });
    }
};

const buildDynamoDbParams = event => {
    const data = JSON.parse(event.body);

    return {
        TableName: process.env.DYNAMODB_TABLE,
        Item: {
            id: uuid.v4(),
            vehicle_brand: data.vehicle_brand,
            vehicle_model: data.vehicle_model,
            vehicle_year: data.vehicle_year,
            createdAt: new Date().getTime(),
            updatedAt: new Date().getTime()
        }
    };
};