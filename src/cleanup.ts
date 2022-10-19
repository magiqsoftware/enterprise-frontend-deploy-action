import * as core from '@actions/core';

export const cleanup = async () => {
    try {
        const deployedArtifact = core.getInput('artifact-number');
        core.notice(`The build that got deployed ${deployedArtifact}`);
    } catch (error) {
        core.setFailed(error.message);
    }
};

/* istanbul ignore next */
if (require.main === module) {
    cleanup();
}
