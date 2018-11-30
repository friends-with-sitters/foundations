const response = require('cfn-response');
const aws = require('aws-sdk');
const pinpoint = new aws.PinpointEmail({ apiVersion: '2016-12-01', region: 'us-east-1' });
exports.handler = (event, context) => {
  if (event.RequestType == 'Delete') {
    response.send(event, context, response.SUCCESS);
    return;
  }
  if (event.RequestType == 'Update') {
    response.send(event, context, response.SUCCESS);
    return;
  }
  if (event.RequestType == 'Create') {
    const { EmailIdentity } = event.ResourceProperties;
    return pinpoint.createEmailIdentity({ EmailIdentity }).promise()
      .then(({ DkimAttributes: { Tokens } }) => {
        response.send(event, context, response.SUCCESS, { Tokens });
      }).catch((err) => {
        console.log(err.stack);
        response.send(event, context, response.FAILED, { Error: err });
        throw err;
      });
  }
};