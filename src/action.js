const core = require('@actions/core');
const { exec } = require('@actions/exec');
const fs = require('fs');

const { projectId, firebaseToken, config, entryPoint } = {
  projectId: core.getInput('projectId'),
  firebaseToken: core.getInput('firebaseToken'),
  config: core.getInput('config'),
  entryPoint: core.getInput('entryPoint'),
};

const run = async () => {
  try {
    core.startGroup(`Verifying ${config} exists`);
    if (entryPoint !== '.') {
      console.log(`Changing to directory: ${entryPoint}`);

      try {
        process.chdir(entryPoint);
      } catch (err) {
        throw Error(`Error changing to directory ${entryPoint}: ${err}`);
      }
    }
    if (fs.existsSync(config)) {
      console.log(`Found ${config}`);
    } else {
      throw Error(
        `${config} file not found. If your firebase.json file is not in the root of your repo, edit the entryPoint option of this GitHub action.`
      );
    }
    core.endGroup();

    core.startGroup('Deploying');

    const result = await exec('npx firebase-tools deploy', [
      '--only hosting',
      '--token',
      firebaseToken,
      '--config',
      config,
      '--project',
      projectId,
    ]);
    console.log(JSON.parse(result));
  } catch (error) {
    core.setFailed(error.message);
  }
};

run();
