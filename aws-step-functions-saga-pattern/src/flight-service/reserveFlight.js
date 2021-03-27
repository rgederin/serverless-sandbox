const AWS = require("aws-sdk");
const dynamodb = new AWS.DynamoDB.DocumentClient();

module.exports.handler = async event => {
    console.log("request:", JSON.stringify(event, undefined, 2));

    let flightBookingID = hashCode('' + event.trip_id + event.depart + event.arrive);

    // If we passed the parameter to fail this step 
    if (event.run_type === 'failFlightsReservation') {
        throw new Error('Failed to book the flights');
    }

    const params = {
        TableName: process.env.DYNAMODB_TABLE,
        Item: {
            'pk': event.trip_id,
            'sk': 'FLIGHT#' + flightBookingID,
            'type': 'Flight',
            'trip_id': event.trip_id,
            'id': flightBookingID,
            'depart': event.depart,
            'depart_at': event.depart_at,
            'arrive': event.arrive,
            'arrive_at': event.arrive_at,
            'transaction_status': 'pending'
        }
    };


    // Call DynamoDB to add the item to the table
    const result = await dynamodb.put(params).promise().catch((error) => {
        throw new Error(error);
    });

    console.log('inserted flight booking:');
    console.log(result);

    // return status of ok
    return {
        status: "ok",
        booking_id: flightBookingID
    }
}

function hashCode(string) {
    let hash;

    for (let i = 0; i < string.length; i++) {
        hash = Math.imul(31, hash) + string.charCodeAt(i) | 0;
    }

    return '' + Math.abs(hash);
}