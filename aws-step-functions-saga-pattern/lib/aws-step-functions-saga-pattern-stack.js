const cdk = require('@aws-cdk/core');
const lambda = require('@aws-cdk/aws-lambda');
const dynamodb = require('@aws-cdk/aws-dynamodb');
const sfn = require('@aws-cdk/aws-stepfunctions');
const tasks = require('@aws-cdk/aws-stepfunctions-tasks');
const apigw = require('@aws-cdk/aws-apigateway');

class AwsStepFunctionsSagaPatternStack extends cdk.Stack {

  constructor(scope, id, props) {
    super(scope, id, props);

    const bookingsTable = this.createTable();

    /**
     * Lambda Functions
     * 
     * We need Booking and Cancellation functions for our 3 services
     * All functions need access to our DynamoDB table above.
     * 
     * We also need to take payment for this trip
     * 
     * 1) Flights
     * 2) Hotel
     * 3) Payment
     */

    // 1) Flights 
    const reserveFlightLambda = this.createLambda(this, 'reserveFlightLambdaHandler', 'reserveFlight.handler', 'src/flight-service', bookingsTable);
    const confirmFlightLambda = this.createLambda(this, 'confirmFlightLambdaHandler', 'confirmFlight.handler', 'src/flight-service', bookingsTable);
    const cancelFlightLambda = this.createLambda(this, 'cancelFlightLambdaHandler', 'cancelFlight.handler', 'src/flight-service', bookingsTable);

    // 2) Hotel 
    const reserveHotelLambda = this.createLambda(this, 'reserveHotelLambdaHandler', 'reserveHotel.handler', 'src/hotel-service', bookingsTable);
    const confirmHotellambda = this.createLambda(this, 'confirmHotelLambdaHandler', 'confirmHotel.handler', 'src/hotel-service', bookingsTable);
    const cancelHotelLambda = this.createLambda(this, 'cancelHotelLambdaHandler', 'cancelHotel.handler', 'src/hotel-service', bookingsTable);

    // 3) Payment For Holiday
    const takePaymentLambda = this.createLambda(this, 'takePaymentLambdaHandler', 'takePayment.handler', 'src/payment-service', bookingsTable);
    const refundPaymentLambda = this.createLambda(this, 'refundPaymentLambdaHandler', 'refundPayment.handler', 'src/payment-service', bookingsTable);

    // Two end states - one for succsess booking, one for failed
    const bookingFailed = new sfn.Fail(this, "Sorry, We Couldn't make the booking", {});
    const bookingSucceeded = new sfn.Succeed(this, 'We have made your booking!');

    const cancelHotelReservation = new sfn.Task(this, 'CancelHotelReservation', {
      task: new tasks.RunLambdaTask(cancelHotelLambda),
      resultPath: '$.CancelHotelReservationResult',
    }).addRetry({ maxAttempts: 3 }) // retry this task a max of 3 times if it fails
      .next(bookingFailed);

    const reserveHotel = new sfn.Task(this, 'ReserveHotel', {
      task: new tasks.RunLambdaTask(reserveHotelLambda),
      resultPath: '$.ReserveHotelResult',
    }).addCatch(cancelHotelReservation, {
      resultPath: "$.ReserveHotelError"
    });

    const cancelFlightReservation = new sfn.Task(this, 'CancelFlightReservation', {
      task: new tasks.RunLambdaTask(cancelFlightLambda),
      resultPath: '$.CancelFlightReservationResult',
    }).addRetry({ maxAttempts: 3 }) // retry this task a max of 3 times if it fails
      .next(cancelHotelReservation);

    const reserveFlight = new sfn.Task(this, 'ReserveFlight', {
      task: new tasks.RunLambdaTask(reserveFlightLambda),
      resultPath: '$.ReserveFlightResult',
    }).addCatch(cancelFlightReservation, {
      resultPath: "$.ReserveFlightError"
    });

    /**
     * 2) Take Payment
     */
    const refundPayment = new sfn.Task(this, 'RefundPayment', {
      task: new tasks.RunLambdaTask(refundPaymentLambda),
      resultPath: '$.RefundPaymentResult',
    }).addRetry({ maxAttempts: 3 }) // retry this task a max of 3 times if it fails
      .next(cancelFlightReservation);

    const takePayment = new sfn.Task(this, 'TakePayment', {
      task: new tasks.RunLambdaTask(takePaymentLambda),
      resultPath: '$.TakePaymentResult',
    }).addCatch(refundPayment, {
      resultPath: "$.TakePaymentError"
    });

    /**
     * 3) Confirm Flight and Hotel booking
     */
    const confirmHotelBooking = new sfn.Task(this, 'ConfirmHotelBooking', {
      task: new tasks.RunLambdaTask(confirmHotellambda),
      resultPath: '$.ConfirmHotelBookingResult',
    }).addCatch(refundPayment, {
      resultPath: "$.ConfirmHotelBookingError"
    });

    const confirmFlight = new sfn.Task(this, 'ConfirmFlight', {
      task: new tasks.RunLambdaTask(confirmFlightLambda),
      resultPath: '$.ConfirmFlightResult',
    }).addCatch(refundPayment, {
      resultPath: "$.ConfirmFlightError"
    });

    //Step function definition
    const definition = sfn.Chain
      .start(reserveHotel)
      .next(reserveFlight)
      .next(takePayment)
      .next(confirmHotelBooking)
      .next(confirmFlight)
      .next(bookingSucceeded)

    const saga = new sfn.StateMachine(this, 'BookingSaga', {
      definition,
      timeout: cdk.Duration.minutes(5)
    });

    // defines an AWS Lambda resource to connect to our API Gateway and kick
    // off our step function
    const sagaLambda = new lambda.Function(this, 'sagaLambdaHandler', {
      runtime: lambda.Runtime.NODEJS_12_X,
      code: lambda.Code.fromAsset('src'),
      handler: 'sagaEntryPoint.handler',
      environment: {
        statemachine_arn: saga.stateMachineArn
      }
    });

    saga.grantStartExecution(sagaLambda);

    /**
     * Simple API Gateway proxy integration
     */
    // defines an API Gateway REST API resource backed by our "stateMachineLambda" function.
    new apigw.LambdaRestApi(this, 'SagaPatternSingleTable', {
      handler: sagaLambda
    });
  };

  createLambda = (scope, id, handler, src, table) => {
    const lambdaFunction = new lambda.Function(scope, id, {
      runtime: lambda.Runtime.NODEJS_12_X,
      code: lambda.Code.fromAsset(src),
      handler: handler,
      environment: {
        DYNAMODB_TABLE: table.tableName
      }
    });

    table.grantReadWriteData(lambdaFunction);

    return lambdaFunction;
  };

  createTable = () => {
    return new dynamodb.Table(this, 'Bookings', {
      partitionKey: { name: 'pk', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'sk', type: dynamodb.AttributeType.STRING }
    });
  };

}

module.exports = { AwsStepFunctionsSagaPatternStack }
