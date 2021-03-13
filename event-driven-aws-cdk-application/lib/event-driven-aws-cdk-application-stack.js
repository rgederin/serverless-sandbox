const cdk = require('@aws-cdk/core');
const lambda = require('@aws-cdk/aws-lambda');
const api = require('@aws-cdk/aws-apigateway');

const apiDynamodbServiceHandlers = 'src/api-dynamodb-service/handlers';

class EventDrivenAwsCdkApplicationStack extends cdk.Stack {

  constructor(scope, id, props) {
    super(scope, id, props);

    const createVehicleLambda = this.createLambda(this, 'createVehicle', 'createVehicle.handler', apiDynamodbServiceHandlers);
    const updateVehicleLambda = this.createLambda(this, 'updateVehicle', 'updateVehicle.handler', apiDynamodbServiceHandlers);
    const listVehicleLambda = this.createLambda(this, 'listVehicle', 'listVehicle.handler', apiDynamodbServiceHandlers);
    const getVehicleLambda = this.createLambda(this, 'getVehicle', 'getVehicle.handler', apiDynamodbServiceHandlers);
    const deleteVehicleLambda = this.createLambda(this, 'deleteVehicle', 'deleteVehicle.handler', apiDynamodbServiceHandlers);

    const processS3Lambda = this.createLambda(this, 'processS3Bucket', 'processS3Bucket.handler', 'src/s3-sqs-service/handlers');
    const processSQSMessageLambda = this.createLambda(this, 'processSQSMessage', 'processSQSMessage.handler', 'src/sqs-dynamodb-service/handlers');

    const restApi = new api.RestApi(this, 'vehicles-api');

    const vehicles = restApi.root.addResource('vehicles');
    const vehicle = vehicles.addResource('{vehicle_id}');

    const listVehiclesLambdaIntegration = new api.LambdaIntegration(listVehicleLambda);
    const createVehicleLambdaIntegration = new api.LambdaIntegration(createVehicleLambda);
    const getVehicleLambdaIntegration = new api.LambdaIntegration(getVehicleLambda);
    const updateVehicleLambdaIntegration = new api.LambdaIntegration(updateVehicleLambda);
    const deleteVehicleLambdaIntegration = new api.LambdaIntegration(deleteVehicleLambda);

    vehicles.addMethod('GET', listVehiclesLambdaIntegration);
    vehicles.addMethod('POST', createVehicleLambdaIntegration);
    vehicle.addMethod('GET', getVehicleLambdaIntegration);
    vehicle.addMethod('PUT', updateVehicleLambdaIntegration);
    vehicle.addMethod('DELETE', deleteVehicleLambdaIntegration);
  };

  createLambda = (scope, id, handler, src) => {
    const lambdaFunction = new lambda.Function(scope, id, {
      runtime: lambda.Runtime.NODEJS_12_X,
      code: lambda.Code.fromAsset(src),
      handler: handler
    });

    return lambdaFunction;
  }

}

module.exports = { EventDrivenAwsCdkApplicationStack }
