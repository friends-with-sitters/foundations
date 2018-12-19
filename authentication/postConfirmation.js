const { DynamoDB, SNS, CognitoIdentityServiceProvider } = require('aws-sdk');
const { REFERRAL_TABLE: TableName, MESSAGE_TEMPLATE: template, AWS_REGION: region } = process.env;
const dynamo = new DynamoDB.DocumentClient({ service: new DynamoDB({ region }), params: { TableName } });
const sns = new SNS({ region: 'eu-west-1' });

const KeyConditionExpression = 'phone_number = :pn and referral_code > :rc';

exports.handler = ({ userPoolId, userName, triggerSource, request }, ctx, callback) => {
  const { userAttributes: { phone_number: PhoneNumber, name } } = request;

  // exit if this is not a sign up trigger
  if (triggerSource !== 'PostConfirmation_ConfirmSignUp') return callback(null, event);

  // initialise cognito client
  const cognito = new CognitoIdentityServiceProvider({ region, params: { Username: userName, UserPoolId: userPoolId } });

  const actions = [
    // send a short welcome message to the user
    sns.publish({ PhoneNumber, Message: template.replace('{####}', name) }).promise(),
    // set the referrer id for the user
    dynamo.query({ KeyConditionExpression, ExpressionAttributeValues: { ':pn': PhoneNumber, ':rc': '0' } }).promise()
      .then(({ Items: [item] }) => cognito.adminUpdateUserAttributes({
        UserAttributes: [{ Name: 'dev:custom:referrer_id', Value: item.principal_id }],
      }).promise()),
  ];

  Promise.all(actions).then(() => callback(null, event)).catch(callback);
};