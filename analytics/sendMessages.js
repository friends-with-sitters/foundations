const Pinpoint = require('aws-sdk/clients/pinpoint');
const { APPLICATION_ID: ApplicationId, AWS_REGION: region } = process.env;
const pinpoint = new Pinpoint({ region, params: { ApplicationId } });

exports.handler = ({ Records }, ctx, cb) => {
  Promise.all(Records.map(({ Sns: { Message } }) => (
    pinpoint.sendMessages(JSON.parse(Message)).promise()
  ))).then(data => cb(null, data)).catch(cb);
};