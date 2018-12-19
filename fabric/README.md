# 👕 Fabric

Events are fired across our infrastructure and applications, which may trigger other actions within our infrastructure in a de-centralized fashion.

"Fabric" is a single SNS Topic which resides in the master region with KMS encryption enabled. All events are fired into this topic, with delivery filters applied to all subscriptions. 

## Deployment

From this directory: 

1. `npm install @friendswithsitters/fabric --prefix layer/nodejs`
1. `aws cloudformation package --template-file service.yml --s3-bucket <s3_bucket> --output-template-file packaged.yml`
1. `aws cloudformation create-stack-set --cli-input-json file://stack-set.json --template-body file://packaged.yml`
1. `aws cloudformation create-stack-instances --cli-input-json file://stack-instances.json`

## Fabric SDK

The Fabric SDK can be installed in Lambda as a layer, or from NPM. 

More info: https://github.com/friends-with-sitters/fabric

#### References

https://docs.aws.amazon.com/sns/latest/dg/sns-message-filtering.html

