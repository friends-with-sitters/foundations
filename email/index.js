const DynamoDB = require('aws-sdk/clients/dynamodb');

const { AWS_REGION, SENT_TABLE } = process.env;

const service = new DynamoDB({ region: AWS_REGION });

const client = new DynamoDB.DocumentClient({ service });

const storeEvent = ({ eventType: event, mail: { timestamp, destination: [email] } }) => {
  const item = { event, timestamp, email, data };
  return client.put({ TableName: SENT_TABLE, Item: item }).promise();
}

exports.handler = ({ Records: records }, context, cb) => {
  const events = records.map(({ Sns: { Message } }) => JSON.parse(Message));
  Promise.all(events.map(storeEvent)).then(() => cb(null, true)).catch(cb);
};