const { DynamoDB, Pinpoint, CognitoIdentityServiceProvider } = require('aws-sdk');
const { REFERRAL_TABLE: TableName, AWS_REGION: region } = process.env;
const dynamo = new DynamoDB.DocumentClient({ service: new DynamoDB({ region }), params: { TableName } });
const pinpoint = new Pinpoint({ region: 'us-east-1' });

exports.handler = (event, ctx, callback) => {
  const { userPoolId, request: { userAttributes, validationData } } = event;
  const { phone_number: phoneNumber } = userAttributes;
  const { referral_code: referralCode } = validationData;

  // exit if request is admin creating a user
  if (event.triggerSource === 'PreSignUp_AdminCreateUser') return callback(null, event);
  
  // ensure a referral code is set
  if (!referralCode) return callback(new Error('Referral code missing from sign up.'));

  // initialise cognito client
  const cognito = new CognitoIdentityServiceProvider({ region, params: { UserPoolId: userPoolId } });

  const actions = [
    // check for duplicate users with the same phone number
    cognito.listUsers({ Filter: `phone_number = \"${phoneNumber}\"` }).promise()
      .then(({ Users: users }) => {
        if (users.length > 0) throw new Error(`Phone number "${phoneNumber}" is already registered.`);
      }),
    // ensure the number is valid and registered to a valid mobile
    pinpoint.phoneNumberValidate({ NumberValidateRequest: { PhoneNumber: phoneNumber } }).promise()
      .then(({ NumberValidateResponse: { PhoneType } }) => {
        if (PhoneType !== 'MOBILE') throw new Error(`Phone number "${phoneNumber}" is invalid, or not a mobile number.`);
      }),
    // check that the referral code is valid
    dynamo.get({ Key: { phone_number: phoneNumber, referral_code: referralCode } }).promise()
      .then(({ Item: item }) => {
        if (!item) throw new Error(`Referral code "${referralCode}" is invalid.`);
      }),
  ];

  Promise.all(actions).then(() => callback(null, event)).catch(callback);
};