const AWS = require("aws-sdk");
const dynamodb = new AWS.DynamoDB.DocumentClient();

module.exports.handler = async event => {
    console.log("request:", JSON.stringify(event, undefined, 2));

    let flightBookingID = '';
    if (event.ReserveFlightResult !== 'undefined') {
        flightBookingID = event.ReserveFlightResult.Payload.booking_id;
    }

    let hotelBookingID = '';
    if (event.ReserveHotelResult !== 'undefined') {
        hotelBookingID = event.ReserveHotelResult.Payload.booking_id;
    }

    const paymentID = hashCode('' + event.trip_id + hotelBookingID + flightBookingID);

    console.log('flightBookingID: ', flightBookingID);
    console.log('hotelBookingID', hotelBookingID);
    console.log('paymentID', paymentID)

    // If we passed the parameter to fail this step 
    if (event.run_type === 'failPayment') {
        throw new Error('Failed to book the flights');
    }

    var params = {
        TableName: process.env.DYNAMODB_TABLE,
        Item: {
            'pk': event.trip_id,
            'sk': 'PAYMENT#' + paymentID,
            'type': 'Payment',
            'trip_id': event.trip_id,
            'id': paymentID,
            'amount': '450.00',
            'currency': 'USD',
            'transaction_status': "confirmed"
        }
    };

    // Call DynamoDB to add the item to the table
    const result = await dynamodb.put(params).promise().catch((error) => {
        throw new Error(error);
    });

    console.log('Payment Taken Successfully:');
    console.log(result);

    // return status of ok
    return {
        status: "ok",
        payment_id: paymentID
    };
};

function hashCode(string) {
    let hash;

    for (let i = 0; i < string.length; i++) {
        hash = Math.imul(31, hash) + string.charCodeAt(i) | 0;
    }

    return '' + Math.abs(hash);
};