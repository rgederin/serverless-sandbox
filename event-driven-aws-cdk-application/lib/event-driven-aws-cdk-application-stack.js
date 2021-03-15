const cdk = require('@aws-cdk/core');
const lambda = require('@aws-cdk/aws-lambda');
const api = require('@aws-cdk/aws-apigateway');
const dynamodb = require('@aws-cdk/aws-dynamodb');
const eventSource = require('@aws-cdk/aws-lambda-event-sources');
const s3 = require('@aws-cdk/aws-s3');
const sqs = require('@aws-cdk/aws-sqs');
const { SqsEventSource } = require('@aws-cdk/aws-lambda-event-sources');

const S3EventSource = eventSource.S3EventSource;
const apiDynamodbServiceHandlers = 'src/api-dynamodb-service/handlers';

class EventDrivenAwsCdkApplicationStack extends cdk.Stack {

  constructor(scope, id, props) {
    super(scope, id, props);

    const vehiclesTable = new dynamodb.Table(this, 'Vehicles', {
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
    });

    const vehicleQueue = new sqs.Queue(this, 'VehiclesQueue');

    const bucket = new s3.Bucket(this, 'rgederin-aws-cdk-bucket');

    const createVehicleLambda = this.createLambda(this, 'createVehicle', 'createVehicle.handler', apiDynamodbServiceHandlers, vehiclesTable);
    const updateVehicleLambda = this.createLambda(this, 'updateVehicle', 'updateVehicle.handler', apiDynamodbServiceHandlers, vehiclesTable);
    const listVehiclesLambda = this.createLambda(this, 'listVehicles', 'listVehicles.handler', apiDynamodbServiceHandlers, vehiclesTable);
    const getVehicleLambda = this.createLambda(this, 'getVehicle', 'getVehicle.handler', apiDynamodbServiceHandlers, vehiclesTable);
    const deleteVehicleLambda = this.createLambda(this, 'deleteVehicle', 'deleteVehicle.handler', apiDynamodbServiceHandlers, vehiclesTable);

    const processS3Lambda = this.createLambda(this, 'processS3Bucket', 'processS3Bucket.handler', 'src/s3-sqs-service/handlers', undefined, vehicleQueue);
    const processSQSMessageLambda = this.createLambda(this, 'processSQSMessage', 'processSQSMessage.handler', 'src/sqs-dynamodb-service/handlers', vehiclesTable);

    const restApi = new api.RestApi(this, 'vehicles-api');

    const vehicles = restApi.root.addResource('vehicles');
    const vehicle = vehicles.addResource('{vehicle_id}');

    const listVehiclesLambdaIntegration = new api.LambdaIntegration(listVehiclesLambda);
    const createVehicleLambdaIntegration = new api.LambdaIntegration(createVehicleLambda);
    const getVehicleLambdaIntegration = new api.LambdaIntegration(getVehicleLambda);
    const updateVehicleLambdaIntegration = new api.LambdaIntegration(updateVehicleLambda);
    const deleteVehicleLambdaIntegration = new api.LambdaIntegration(deleteVehicleLambda);

    vehicles.addMethod('GET', listVehiclesLambdaIntegration);
    vehicles.addMethod('POST', createVehicleLambdaIntegration);
    vehicle.addMethod('GET', getVehicleLambdaIntegration);
    vehicle.addMethod('PUT', updateVehicleLambdaIntegration);
    vehicle.addMethod('DELETE', deleteVehicleLambdaIntegration);

    processS3Lambda.addEventSource(new S3EventSource(bucket, {
      events: [s3.EventType.OBJECT_CREATED]
    }));

    processSQSMessageLambda.addEventSource(new SqsEventSource(vehicleQueue));

    bucket.grantReadWrite(processS3Lambda);
  };

  createLambda = (scope, id, handler, src, table, queue) => {
    const lambdaFunction = new lambda.Function(scope, id, {
      runtime: lambda.Runtime.NODEJS_12_X,
      code: lambda.Code.fromAsset(src),
      handler: handler,
      environment: {
        DYNAMODB_TABLE: table ? table.tableName : '',
        QUEUE_URL: queue ? queue.queueUrl : ''
      }
    });

    if (table) {
      // Give our Lambda permissions to read and write data from the passed in DynamoDB table
      table.grantReadWriteData(lambdaFunction);
    }

    if (queue) {
      queue.grantSendMessages(lambdaFunction);
    }

    return lambdaFunction;
  }

}

module.exports = { EventDrivenAwsCdkApplicationStack }
