const AWS = require("aws-sdk");
const dynamodb = new AWS.DynamoDB.DocumentClient();

module.exports.handler = async event => {
    console.log("request:", JSON.stringify(event, undefined, 2));

    const hotelBookingID = hashCode('' + event.trip_id + event.hotel + event.check_in);

    // If we passed the parameter to fail this step 
    if (event.run_type === 'failHotelReservation') {
        throw new Error("Failed to reserve the hotel");
    }

    const params = {
        TableName: process.env.DYNAMODB_TABLE,
        Item: {
            'pk': event.trip_id,
            'sk': 'HOTEL#' + hotelBookingID,
            'trip_id': event.trip_id,
            'type': 'Hotel',
            'id': hotelBookingID,
            'hotel': event.hotel,
            'check_in': event.check_in,
            'check_out': event.check_out,
            'transaction_status': 'pending'
        }
    };

    // Call DynamoDB to add the item to the table
    const result = await dynamodb.put(params).promise().catch((error) => {
        throw new Error(error);
    });

    console.log('inserted hotel booking:');
    console.log(result);

    // return status of ok
    return {
        status: "ok",
        booking_id: hotelBookingID
    }
};

function hashCode(string) {
    let hash;

    for (let i = 0; i < string.length; i++) {
        hash = Math.imul(31, hash) + string.charCodeAt(i) | 0;
    }

    return '' + Math.abs(hash);
}

