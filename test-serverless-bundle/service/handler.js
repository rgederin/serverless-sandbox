import dynamoDb from "../libs/aws";

export async function hello(event) {
  console.log("getVehicle lambda event: ", event);

  const dynamoDbParameters = buildDynamoDbParams(event);
  console.log(dynamoDbParameters);
  try {
    const result = await dynamoDb.scan(dynamoDbParameters);
    return success(result.Items);
  } catch (e) {
    console.log("error: ", e);
    return failure({ status: false });
  }
};

const buildDynamoDbParams = () => {
  return {
    TableName: process.env.DYNAMODB_TABLE
  };
};

const success = body => {
  return buildResponse(200, body);
};

const failure = body => {
  return buildResponse(500, body);
};

const buildResponse = (statusCode, body) => {
  return {
    statusCode: statusCode,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": true
    },
    body: JSON.stringify(body)
  };
};