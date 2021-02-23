const dynamoDbSaver = require('../utils/saver');

module.exports.main = async event => {
  console.log("processSqsMessage lambda event: ", event);

  await Promise.all(
    event.Records.map(async (event) => {
      const items = JSON.parse(event.body);
      console.log(JSON.stringify(items, null, 2));
      await dynamoDbSaver.saveInDynamoDb(items, process.env.DYNAMODB_TABLE);
    })
  );
};