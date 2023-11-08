import { getFileHash } from '../utils/tar'
import { FormData } from 'formdata-node'
import { fileFromPath } from 'formdata-node/file-from-path'
import { ServiceBase } from './serviceBase'

export class Package extends ServiceBase {
  private packages : any

  async migration() {

    this.packages = await this.getPackages()

    console.log('@@@@@@@ ', this.packages);

    await this.downloadPackages()

    await this.deployPackages()

    await this.buildPkg()

    await this.checkBuildInstallPkg()
  }

  // pkg/installed
  private async getPackages() {
    return await this.sourceApiRequest.get('/pkg/installed')
  }

  // pkg/source/:name/:hash
  private async downloadPackages() {
    console.log('Start download')
    await Promise.all(this.packages.result.map(async (pkg : any) => {
      console.log('Download', pkg.name)
      await this.sourceApiRequest.getFile(`/pkg/source/${pkg.name}/${pkg.source.hash}`, pkg.name)
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
      const { result }  : any = await this.targetApiRequest.post(`/pkg/source/${pkg.name}`, formData, true)
      console.log('Deploy result ', result)
      const { name, hash } = result

      if (name && hash) {
        pkg.newHash = hash
        this.logger.log({
          level: 'info',
          message: `${this.targetAuthorizeData.ORG_NAME} ${name} Upload success!`
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
      const { result } : any = await this.targetApiRequest.post('/pkgr/build', body)
      console.log('Build result ', result)
      const { id: buildId } = result

      pkg.buildId = buildId

      this.logger.log({
        level: 'info',
        message: `${this.targetAuthorizeData.ORG_NAME} ${pkg.name} startBuild success!`
      })
    }))
    console.log('End build')
  }

  private async checkBuildInstallPkg() {
    let checkCount = 0
    const checkBuild = setInterval(async () => {
      console.log('Start check build ', checkCount)
      await Promise.all(this.packages.result.filter((pkg : any) => (!pkg.checkTime && pkg.checkTime < 3) || !pkg.passed).map(async (pkg : any) => {
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

          console.log('Install ', pkg.name)
          const result = await this.targetApiRequest.post(`/pkgr/build/install/${pkg.buildId}`)
          console.log('Install result ', result)
        }

        if (pkg.checkTime == 3 || status == 'Failed') {
          this.logger.log({
            level: 'error',
            message: `${this.targetAuthorizeData.ORG_NAME} ${pkg.name} build failed!`
          })

          checkCount++
        }


        if (checkCount >= this.packages.result.length) {
          clearInterval(checkBuild)
        }
      }))
      console.log('End check build ', checkCount)
    }, 1000 * 60)
  }

  private async getBuildStatus(id: string) {
    const { result } : any = await this.targetApiRequest.get(`/pkg/builds/${id}`)

    return result
  }
}

