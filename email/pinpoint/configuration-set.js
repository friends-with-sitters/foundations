const response = require('cfn-response');
const aws = require('aws-sdk');
const pinpoint = new aws.PinpointEmail({ apiVersion: '2016-12-01', region: 'us-east-1' });
exports.handler = function (event, context) {
  if (event.RequestType == 'Delete') {
    response.send(event, context, response.SUCCESS);
    return;
  }
  if (event.RequestType == 'Update') {
    response.send(event, context, response.SUCCESS);
    return;
  }
  if (event.RequestType == 'Create') {
    const params = event.ResourceProperties;
    delete params.ServiceToken;
    return pinpoint.createConfigurationSet(params).promise()
      .then(() => {
        const { ConfigurationSetName } = params;
        const responseData = { ConfigurationSetName };
        response.send(event, context, response.SUCCESS, responseData);
      }).catch((err) => {
        console.log(err.stack);
        responseData = { Error: err };
        response.send(event, context, response.FAILED, responseData);
        throw err;
      });
  }
};