const SNS = require('aws-sdk/clients/sns');
const { MESSAGE_TEMPLATE: template } = process.env;
const sns = new SNS({ region: 'eu-west-1' });

exports.handler = ({ Records }, ctx, cb) => {
  Promise.all(Records.map(({ dynamodb: { NewImage }, eventName }) => {
    if (eventName !== 'INSERT') {
      return true;
    }
    return sns.publish({ 
      PhoneNumber: NewImage.phone_number.S, 
      Message: template.replace('{####}', NewImage.referral_code.S),
    }).promise();
  })).then(data => cb(null, data)).catch(cb);;
};