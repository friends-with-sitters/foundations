# Foundation 

🧰 Foundation provides the fundamental, lowest-level infrastructure and services for all our applications. CloudFormation templates are organised and deployed via StackSets, to ensure that necessary multi-region resources can be orchestrated and automated.

* 🌍 **Analytics:** Configures Pinpoint for the `us-east-1` region.
* 🔒 **Authentication:** Deploys Cognito User & Identity Pools.
* 📝 **DNS:** Creates a Hosted Zone, Cloud Map and HTTPs Certificates.
* 🔑 **Key:** Creates a Master KMS key with restrictive policies.
* 💽 **Storage:** Deploys a user storage S3 bucket.