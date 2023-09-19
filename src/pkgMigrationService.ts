import * as fs from 'fs'
import * as path from 'path'

import { getFileHash, createTarBall } from './utils/tar'

import * as winston from 'winston'

import { Fetch } from './utils/fetch'
import { FormData } from 'formdata-node'
import { fileFromPath } from 'formdata-node/file-from-path'

const logger = winston.createLogger({
  format: winston.format.json(),
  defaultMeta: { service: 'user-service' },
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ]
});

export interface AuthorizeData {
  TOKEN: string
  API_SERVER: string
  ORG_NAME: string
}

export class PkgMigrationService {
  private originApiRequest = new Fetch(this.originAuthorizeData)
  private destApiRequest = new Fetch(this.destAuthorizeData)

  private packages : any

  constructor(public originAuthorizeData: AuthorizeData, private destAuthorizeData: AuthorizeData) {

  }

  async migration() {

    this.packages = await this.getPackages()

    console.log('@@@@@@@ ', this.packages);

    await this.downloadPackages()

    await this.deployPackages()

    await this.buildPkg()

    await this.checkBuildPkg()

    await this.installPkg()
  }

  // pkg/installed
  private async getPackages() {
    return await this.originApiRequest.get('/pkg/installed')
  }

  // pkg/source/:name/:hash
  private async downloadPackages() {
    console.log('Start download')
    await Promise.all(this.packages.result.map(async (pkg : any) => {
      console.log('Download', pkg.name)
      await this.originApiRequest.getFile(`/pkg/source/${pkg.name}/${pkg.source.hash}`, pkg.name)
    }))
    console.log('End downdoad')
  }

  // /pkg/source/:name
  private async deployPackages() {
    console.log('Start deploy')
    await Promise.all(this.packages.result.map(async (pkg : any) => {
      const pkgPath = `./packages/${pkg.name}`

      const formData = new FormData()
      formData.set('source', await fileFromPath(pkgPath))
      formData.set('name', pkg.name)
      formData.set('hash', getFileHash(pkgPath))
      formData.set('metadata', JSON.stringify(pkg.metadata))

      console.log('Deploy ', pkg.name)
      const deployedPackage : any = await this.destApiRequest.post(`/pkg/source/${pkg.name}`, formData)

      const { name, hash } = deployedPackage

      console.log('Deploy result ', deployedPackage)
      if (name && hash) {
        pkg.newHash = hash
        logger.log({
          level: 'info',
          message: `${this.destAuthorizeData.ORG_NAME} ${name} Upload success!`
        })
      }
    }))
    console.log('End deploy')
  }

  // /pkgr/build
  private async buildPkg() {
    console.log('Start build')
    await Promise.all(this.packages.result.map(async (pkg : any) => {

      const body = {
        name: pkg.name,
        hash: pkg.newHash,
        action: 'deploy'
      }

      console.log('Build ', pkg.name)
      const { result } : any = await this.destApiRequest.post('/pkg/build', body)

      const { id: buildId } = result

      pkg.buildId = buildId

      logger.log({
        level: 'info',
        message: `${this.destAuthorizeData.ORG_NAME} ${pkg.name} startBuild success!`
      })
    }))
    console.log('End build')
  }

  private checkBuildPkg() {
    let checkCount = 0
    const checkBuild = setInterval(async () => {
      console.log('Start check build ', checkCount)
      await Promise.all(this.packages.result.map(async (pkg : any) => {
        if (!pkg.checkTime) {
          pkg.checkTime = 0
        }
        pkg.checkTime += 1
        console.log('Check build ', pkg.name, ' - ', pkg.checkTime)
        const { status } : any = await this.getBuildStatus(pkg.buildId)
        console.log(`running interval check - ${pkg.name} build status is`, status)
        if (status == 'Passed') {
          pkg.passed = true
          checkCount++
        }

        if (pkg.checkTime == 3 || status == 'Failed') {
          logger.log({
            level: 'error',
            message: `${this.destAuthorizeData.ORG_NAME} ${pkg.name} build failed!`
          })

          checkCount++
        }


        if (checkCount == this.packages.size) {
          clearInterval(checkBuild)
        }
      }))
      console.log('End check build ', checkCount)
    }, 1000 * 60)
  }


  private async getBuildStatus(id: string) {
    const { result } : any = await this.destApiRequest.get(`/pkg/builds/${id}`)

    return result
  }

  private async installPkg() {
    console.log('Start install')
    await Promise.all(this.packages.result.map(async (pkg : any) => {
      console.log('Install ', pkg.name)
      await this.destApiRequest.post(`/pkgr/build/install/${pkg.buildId}`)
    }))
    console.log('End install')
  }
}

