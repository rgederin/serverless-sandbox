const AWS = require("aws-sdk");
const dynamodb = new AWS.DynamoDB.DocumentClient();

module.exports.handler = async event => {
    console.log("request:", JSON.stringify(event, undefined, 2));

    // If we passed the parameter to fail this step 
    if (event.run_type === 'failFlightsConfirmation') {
        throw new Error('Failed to book the flights');
    }

    let bookingID = '';
    if (event.ReserveFlightResult !== 'undefined') {
        bookingID = event.ReserveFlightResult.Payload.booking_id;
    }

    const params = {
        TableName: process.env.DYNAMODB_TABLE,
        Key: {
            'pk': event.trip_id,
            'sk': 'FLIGHT#' + bookingID
        },
        "UpdateExpression": "set transaction_status = :booked",
        "ExpressionAttributeValues": {
            ":booked": "confirmed"
        }
    }

    // Call DynamoDB to add the item to the table
    const result = await dynamodb.update(params).promise().catch((error) => {
        throw new Error(error);
    });

    console.log('confirmed flight booking:');
    console.log(result);

    // return status of ok
    return {
        status: "ok",
        booking_id: bookingID
    }
}