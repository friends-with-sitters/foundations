const { DynamoDB, Pinpoint } = require('aws-sdk');
const { REFERRAL_TABLE: TableName, AWS_REGION: region } = process.env;
const dynamo = new DynamoDB.DocumentClient({ service: new DynamoDB({ region }), params: { TableName } });
const pinpoint = new Pinpoint({ region: 'us-east-1' });

exports.handler = (event, ctx, callback) => {
  const phoneNumber = event.request.userAttributes.phone_number;
  const referralCode = event.request.validationData.referral_code;

  // exit if request is admin creating a user
  if (event.triggerSource === 'PreSignUp_AdminCreateUser') return callback(null, event);
  // ensure a referral code is set
  if (!referralCode) return callback(new Error('Referral code missing from sign up.'));

  pinpoint.phoneNumberValidate({ NumberValidateRequest: { PhoneNumber: phoneNumber } }).promise()
    // check the phone number is valid
    .then(({ NumberValidateResponse: { CleansedPhoneNumberE164, PhoneType } }) => {
      if (PhoneType !== 'MOBILE') return callback(new Error(`Phone number "${phoneNumber}" is invalid, or not a mobile number.`));
      return CleansedPhoneNumberE164;
    })
    // retrieve the referral code
    .then(cleansed => dynamo.get({ Key: { phone_number: cleansed, referral_code: referralCode } }).promise())
    // check a referral code is correct then set principal referrer and verify
    .then(({ Item: item }) => {
      if (!item) return callback(new Error(`Referral code "${referralCode}" is invalid.`));
      event.response = { autoConfirmUser: true, autoVerifyPhone: true };
      event.request.userAttributes.referrer_id = item.principal_id;
      return item;
    })
    // delete the referral code now its used
    .then(({ phone_number, referral_code }) => dynamo.delete({ Key: { phone_number, referral_code } }).promise())
    // return the callback!
    .then(() => callback(null, event))
    .catch((err) => {
      console.error(err);
      callback(new Error('Internal error. Please try again.'))
    });
};