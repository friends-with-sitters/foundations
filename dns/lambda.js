const response = require("cfn-response");
const AWS = require("aws-sdk");
const { AWS_REGION } = process.env;
const filters = { CertificateStatuses: ['PENDING_VALIDATION', 'ISSUED'] };
exports.handler = (event, context) => {
  const { DomainName, Timeout = 120, Interval = 30 } = event.ResourceProperties;
  const acm = new AWS.ACM({ region: AWS_REGION });
  if (event.RequestType == 'Delete') {
    response.send(event, context, response.SUCCESS);
    return;
  }
  try {
    setInterval(() => {
      acm.listCertificates(filters, (err, { CertificateSummaryList: list }) => {
        if (err) {
          throw err;
        } else {
          const match = list.filter(({ DomainName: name }) => DomainName === name);
          if (match.length > 0) {
            const [{ CertificateArn }] = match;
            acm.describeCertificate({ CertificateArn }, (err, { Certificate }) => {
              if (err) {
                throw err;
              } else {
                const { DomainValidationOptions: [{ ResourceRecord }] } = Certificate;
                response.send(event, context, response.SUCCESS, ResourceRecord, CertificateArn);
              }
            });
          }
        }
      });
    }, Interval * 1000);
    setTimeout(() => {
      throw new Error(`Error retrieving DNS records for "${DomainName}"`);
    }, Timeout * 1000);
  } catch (err) {
    console.error(err.message);
    response.send(event, context, response.FAILED, { Error: err.message }, DomainName);
  }
};