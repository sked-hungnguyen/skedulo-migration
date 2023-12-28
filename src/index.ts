import { AuthorizeData } from './interface/migration'
import { APIService } from './migrationService/apiService'
import * as dotenv from 'dotenv'
import * as core from '@actions/core'
const fs = require('node:fs')

import { Package } from './migrationService/package'
import { OrgPreference } from './migrationService/orgPreference'
import { CustomFields } from './migrationService/customFields'
import { CustomForm } from './migrationService/customForm'

dotenv.config();

const getAPIServer = (url: string) => {
  // if end with / remove it
  if (url[url.length - 1] === '/') {
    url = url.slice(0, -1);
  }

  return url;
}

async function migration() {

  const source: AuthorizeData = {
    TOKEN:
      process.env.SOURCE_TOKEN || core.getInput('SOURCE_TOKEN') || '',
    API_SERVER:
      getAPIServer(process.env.SOURCE_API_SERVER || core.getInput('SOURCE_API_SERVER') || 'https://api.skedulo.com')
  }

  const target: AuthorizeData = {
    TOKEN:
      process.env.TARGET_TOKEN || core.getInput('TARGET_TOKEN') || '',
    API_SERVER:
      getAPIServer(process.env.TARGET_API_SERVER || core.getInput('TARGET_API_SERVER') || 'https://api.skedulo.com')
  }

  const apiService = await APIService.init({ source, target })
  //await apiService.loadTeamName()
  console.log('Migrate ', apiService.authorizeData.source.TEAM_NAME, ' to ', apiService.authorizeData.target.TEAM_NAME)

  /*const pkg = new Package({ apiService })
  await pkg.migrate()

  const orgPreference = new OrgPreference({ apiService })
  await orgPreference.migrate()

  const customFields = new CustomFields({ apiService })
  await customFields.migrate()*/

  const customForm = new CustomForm({ apiService })
  await customForm.migrate()

}

(async () => {
  try {
    fs.rmSync('./download', { force: true, recursive: true })
    const time = new Date().toTimeString();
    core.setOutput('Start time', time);
    await migration()
  } catch (error: any) {
    core.setFailed(error.message)
  }
})();
