
# enterprise-frontend-deploy-action

Action for deploying artifacts to an Amazon S3 bucket for consumption

## Required Parameters

- `artifact-bucket` where to fetch artifact from
- `environment-bucket` where to deploy the artifact

## Optional Parameters

- `artifact-number` build artifact to fetch (default: latest)
- `artifact-prefix` the prefix the artifact is resides in (default: '')
- `app-prefix` which prefix to deploy to (default: '')