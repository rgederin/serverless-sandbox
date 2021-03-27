const AWS = require('aws-sdk');

const stepFunctions = new AWS.StepFunctions({
    region: 'us-west-2'
});

module.exports.handler = async event => {
    const runType = 'success';
    const tripID = "5c12d94a-ee6a-40d9-889b-1d49142248b7";

    const input = {
        "trip_id": tripID,
        "depart": "London",
        "depart_at": "2021-07-10T06:00:00.000Z",
        "arrive": "Dublin",
        "arrive_at": "2021-07-12T08:00:00.000Z",
        "hotel": "holiday inn",
        "check_in": "2021-07-10T12:00:00.000Z",
        "check_out": "2021-07-12T14:00:00.000Z",
        "rental": "Volvo",
        "rental_from": "2021-07-10T00:00:00.000Z",
        "rental_to": "2021-07-12T00:00:00.000Z",
        "run_type": runType
    };

    console.log("saga input: ", input);

    const params = {
        stateMachineArn: process.env.statemachine_arn,
        input: JSON.stringify(input)
    };

    console.log('params:', params);
    console.log('stepfunctions: ', stepFunctions);
    stepFunctions.startExecution(params, (err, data) => {
        console.log('saga started');
        if (err) {
            console.log(err);
            const response = {
                statusCode: 500,
                body: JSON.stringify({
                    message: 'There was an error'
                })
            };
            callback(null, response);
        } else {
            console.log(data);
            const response = {
                statusCode: 200,
                body: JSON.stringify({
                    message: 'The holiday booking system is processing your order'
                })
            };
            callback(null, response);
        }
    });
}