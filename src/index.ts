import * as aws from 'aws-sdk';
import { fromSSO } from '@aws-sdk/credential-provider-sso';
import * as core from '@actions/core';

var credentials = null;
const repo = process.env['GITHUB_REPOSITORY'];

const getS3Bucket = async () => {
    if (repo) {
        return new aws.S3({});
    }
    credentials = await fromSSO({ profile: process.argv[2] })();
    return new aws.S3({ credentials });
};

export const main = async () => {
    try {


    } catch (error) {
        core.setFailed(error.message);
    }
};

/* istanbul ignore next */
if (require.main === module) {
    main();
}
