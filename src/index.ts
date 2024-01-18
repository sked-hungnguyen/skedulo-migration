import { AuthorizeData } from './utils/fetch'
import { APIService } from './migrationService/apiService'
import * as dotenv from 'dotenv'
import * as core from '@actions/core'
const fs = require('node:fs')

import { Package } from './migrationService/package'
import { OrgPreference } from './migrationService/orgPreference'
import { CustomFields } from './migrationService/customFields'
import { CustomForm } from './migrationService/customForm'
import { JobTypes } from './migrationService/jobTypes'
import { JobTemplates } from './migrationService/jobTemplates'

dotenv.config();

const getAPIServer = (url: string) => {
  // if end with / remove it
  if (url[url.length - 1] === '/') {
    url = url.slice(0, -1);
  }

  return url;
}

const serviceMap : any = {
  'Package': Package,
  'OrgPreference': OrgPreference,
  'CustomFields': CustomFields,
  'CustomForm': CustomForm,
  'JobTypes': JobTypes,
  'JobTemplates': JobTemplates
}

async function migration() {
  const SERVICES = (process.env.SERVICES || core.getInput('SERVICES'))?.split(',') || []
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
  console.log('Migrate ', apiService.svcData.source.TEAM_NAME, ' to ', apiService.svcData.target.TEAM_NAME)

  await Promise.all(SERVICES.map(async (service: string) => {
    console.log('Start migrate ', service)
    const svc = new serviceMap[service]( {apiService })
    await svc.migrate()
    console.log('End migrate ', service)
  }))
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
