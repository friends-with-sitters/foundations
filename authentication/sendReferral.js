const SNS = require('aws-sdk/clients/sns');
const { MESSAGE_TEMPLATE: template, AWS_REGION: region } = process.env;
const sns = new SNS({ region });

exports.handler = ({ Records }, ctx, cb) => {
  Promise.all(Records.map(({ dynamodb: { NewImage }, eventName }) => {
    if (eventName !== 'INSERT') {
      return true;
    }
    return sns.publish({ 
      PhoneNumber: NewImage.phone_number, 
      Message: template.replace('{####}', NewImage.referral_code),
    }).promise();
  })).then(data => cb(null, data)).catch(cb);;
};