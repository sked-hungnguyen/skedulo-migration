import { APIService } from './apiService'
import { getFileHash } from '../utils/tar'
import { FormData } from 'formdata-node'
import { fileFromPath } from 'formdata-node/file-from-path'
import { extractTarball, createTarBall } from '../utils/tar'
import { c } from 'tar'
export class Package extends APIService {

  private downloadPath = './download/packages'
  private packages : any

  public async migrate() {

    this.packages = await this.getPackages()
    console.log('Packages ', this.packages)

    if (!this.packages || this.packages.length == 0) {
      return
    }

    await this.downloadPackages()

    await this.deployPackages()

    await this.buildPkg()

    await this.checkBuildInstallPkg()
  }

  // pkg/installed
  private async getPackages() {
    const { result }  : any = await this.source.get('/pkg/installed')
    return result
  }

  // pkg/source/:name/:hash
  private async downloadPackages() {
    console.log('Start download packages')

    const savePath = `${this.downloadPath}/tar`

    await Promise.all(this.packages.map(async (pkg : any) => {
      console.log('Download package ', pkg.name)
      await this.source.getFile(`/pkg/source/${pkg.name}/${pkg.source.hash}`, `${pkg.name}.tar`, savePath)
      await extractTarball(`${savePath}/${pkg.name}`, `${savePath}/${pkg.name}.tar`)
      await createTarBall(`${savePath}/${pkg.name}`, `${this.downloadPath}/${pkg.name}.tar.gz`)
    }))
    console.log('End downdoad packages')
  }

  // /pkg/source/:name
  private async deployPackages() {
    console.log('Start deploy packages')
    await Promise.all(this.packages.map(async (pkg : any) => {
      const pkgFilePath = `${this.downloadPath}/${pkg.name}.tar.gz`

      const formData = new FormData()
      formData.set('source', await fileFromPath(pkgFilePath))
      formData.set('name', pkg.name)
      formData.set('hash', getFileHash(pkgFilePath))
      formData.set('metadata', JSON.stringify(pkg.metadata))

      console.log('Deploy package ', pkg.name)
      const { result }  : any = await this.target.post(`/pkg/source/${pkg.name}`, formData, true)
      console.log('Deploy package result ', result)
      const { name, hash } = result

      if (name && hash) {
        pkg.newHash = hash
        console.log('Deploy package ', pkg.name, ' success')
      }
    }))
    console.log('End deploy packages')
  }

  // /pkgr/build
  private async buildPkg() {
    console.log('Start build packages')
    await Promise.all(this.packages.map(async (pkg : any) => {

      const body = {
        name: pkg.name,
        hash: pkg.newHash,
        action: 'deploy'
      }

      console.log('Build package ', pkg.name)
      const { result } : any = await this.target.post('/pkgr/build', body)
      console.log('Build package result ', result)
      const { id: buildId } = result

      pkg.buildId = buildId
    }))
    console.log('End build packages')
  }

  private async checkBuildInstallPkg() {
    let checkCount = 0
    const checkBuild = setInterval(async () => {
      console.log('Start check build packages', checkCount)
      await Promise.all(this.packages.filter((pkg : any) => (!pkg.checkTime && pkg.checkTime < 3) || !pkg.passed).map(async (pkg : any) => {
        if (!pkg.checkTime) {
          pkg.checkTime = 0
        }
        pkg.checkTime += 1
        console.log('Check build package ', pkg.name, ' - ', pkg.checkTime)
        const { status } : any = await this.getBuildStatus(pkg.buildId)
        console.log(`Running interval check - ${pkg.name} build status is`, status)
        if (status == 'Passed') {
          pkg.passed = true
          checkCount++

          console.log('Install package', pkg.name)
          const result = await this.target.post(`/pkgr/build/install/${pkg.buildId}`)
          console.log('Install package result ', result)
        }

        if (pkg.checkTime == 3 || status == 'Failed') {
          console.log('Build package ', pkg.name, ' failed')
          checkCount++
        }


        if (checkCount >= this.packages.length) {
          clearInterval(checkBuild)
        }
      }))
      console.log('End check build packages ', checkCount)
    }, 1000 * 60)
  }

  private async getBuildStatus(id: string) {
    const { result } : any = await this.target.get(`/pkg/builds/${id}`)

    return result
  }
}

