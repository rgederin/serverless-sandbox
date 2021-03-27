const AWS = require("aws-sdk");
const dynamodb = new AWS.DynamoDB.DocumentClient();

module.exports.handler = async event => {
    console.log("request:", JSON.stringify(event, undefined, 2));

    let bookingID = '';

    // If we passed the parameter to fail this step 
    if (event.run_type === 'failHotelConfirmation') {
        throw new Error('Failed to confirm the hotel booking');
    }

    if (event.ReserveHotelResult !== 'undefined') {
        bookingID = event.ReserveHotelResult.Payload.booking_id;
    }

    const params = {
        TableName: process.env.DYNAMODB_TABLE,
        Key: {
            'pk': event.trip_id,
            'sk': 'HOTEL#' + bookingID
        },
        "UpdateExpression": "set transaction_status = :booked",
        "ExpressionAttributeValues": {
            ":booked": "confirmed"
        }
    };

    // Call DynamoDB to add the item to the table
    let result = await dynamodb.update(params).promise().catch((error) => {
        throw new Error(error);
    });

    console.log('updated hotel booking:');
    console.log(result);

    // return status of ok
    return {
        status: "ok",
        booking_id: bookingID
    };
}