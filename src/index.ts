import * as aws from 'aws-sdk';
import { fromSSO } from '@aws-sdk/credential-provider-sso';
import * as core from '@actions/core';
import fs from 'fs';
import path from 'path';
import { tgz } from 'compressing';
import { spawn } from 'child_process';

var credentials = null;
const repo = process.env['GITHUB_REPOSITORY'];

export const setInput = (name, value) =>
    (process.env[`INPUT_${name.replace(/ /g, '_').toUpperCase()}`] = value);

export const getS3Bucket = async () => {
    if (repo) {
        return new aws.S3({});
    }
    credentials = await fromSSO({ profile: process.argv[2] })();
    return new aws.S3({ credentials });
};

export const getSingleFile = async (bucketName, artifactPrefix, fileName) => {
    const s3 = await getS3Bucket();

    return new Promise((resolve) => {
        core.notice(`Fetching: ${fileName}`);
        const tempFileName = path.join('./', `${fileName}.tgz`);
        const tempFile = fs.createWriteStream(tempFileName);
        const key = `${artifactPrefix}/${fileName}.tgz`;
        s3.getObject({ Bucket: bucketName, Key: key })
            .createReadStream()
            .on('end', () => {
                core.notice(`Fetching: ${fileName} completed`);
                resolve({});
            })
            .pipe(tempFile);
    });
};

export const expandFiles = async(fileName) =>{

    return tgz.uncompress(`${fileName}.tgz`, `./${fileName}`)
    .then(() => {
        core.notice(`Artifact Expanded in to ${fileName}`);
    }).catch(() => {
        core.setFailed("Failed to expanded artifact, please check if artifact exists")
    });
}

export const uploadCoreStatics =async (folderName, bucketName, appPrefix) => {
    return new Promise((resolve) => {
        const upload = spawn('aws', [
            's3',
            'sync',
            '--include',
            '*',
            '--exclude', 
            'index.html',
            '--cache-control',
            'public,max-age=43200,immutable',
            '--delete',
            `${folderName}/`,
            `s3://${bucketName}/${appPrefix}/`
        ])

        upload.stdout.on('data', (data) => {
            core.notice(data.toString());
        })

        upload.stderr.on('data', (data) => {
            core.notice(data.toString());
        })

        upload.on('exit', () => {
            core.notice('Uploaded completed')
            resolve({})
        })
    })
}

export const uploadIndex =async (folderName, bucketName, appPrefix) => {
    return new Promise((resolve) => {
        const upload = spawn('aws', [
            's3',
            'sync',
            '--exclude',
            '*',
            '--include', 
            'index.html',
            '--cache-control',
            'public,max-age=0,no-cache,no-store,must-revalidate',
            '--delete',
            `${folderName}/`,
            `s3://${bucketName}/${appPrefix}/`
        ])

        upload.stdout.on('data', (data) => {
            core.notice(data.toString());
        })

        upload.stderr.on('data', (data) => {
            core.notice(data.toString());
        })

        upload.on('exit', () => {
            core.notice('Uploaded completed')
            resolve({})
        })
    })
}

export const main = async () => {
    try {

        const artifactBucket = core.getInput('artifact-bucket');
        const artifactPrefix = core.getInput('artifact-prefix');
        const artifactNumber = core.getInput('artifact-number');

        const distributionBucket = core.getInput('environment-bucket')
        const distributionPrefix = core.getInput('app-prefix')

        await getSingleFile(artifactBucket, artifactPrefix, artifactNumber);
        await expandFiles(artifactNumber);
        await uploadCoreStatics(artifactNumber, distributionBucket,distributionPrefix);
        await uploadIndex(artifactNumber, distributionBucket,distributionPrefix);

    } catch (error) {
        core.setFailed(error.message);
    }
};

/* istanbul ignore next */
if (require.main === module) {
    main();
}
