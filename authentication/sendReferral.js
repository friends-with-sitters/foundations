const SNS = require('aws-sdk/clients/sns');
const fabric = require('@friendswithsitters/fabric');
const { EVENT: event, MESSAGE_TEMPLATE: template, AWS_REGION: region } = process.env;
const sns = new SNS({ region });

exports.handler = ({ Records }, ctx, cb) => {
  Promise.all(Records.map(({ dynamodb: { NewImage }, eventName }) => {
    if (eventName !== 'INSERT') return true;
    return sns.publish(fabric(event, {
      MessageRequest: {
        Addresses: {
          [NewImage.phone_number.S]: {
            ChannelType: 'SMS',
          }
        },
        MessageConfiguration: {
          SMSMessage: {
            Body: template.replace('{####}', NewImage.referral_code.S),
            MessageType: 'TRANSACTIONAL',
            SenderId: 'Sitters',
          },
        },
      },
    })).promise();
  })).then(data => cb(null, data)).catch(cb);;
};