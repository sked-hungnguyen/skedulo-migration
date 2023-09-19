import * as tar from 'tar'
import * as crypto from 'crypto'
import * as fs from 'fs'

export async function extractTarball(destFolder: string, tarball: string) {
  console.log('Extract ', destFolder, ' ', tarball)
  return tar.x({
    cwd: destFolder,
    file: tarball
  })
}

export async function createTarBall(destFolder: string, destFile: string) {
  console.log('Tar ', destFolder, ' ', destFile)
  return tar
    .c({
      file: destFile,
      cwd: destFolder,
      gzip: true
    }, ['.'])
    .then(() => destFile)
}

export function getFileHash(file: string) {
  const hash = crypto.createHash('sha256')
  const f =  fs.readFileSync(file)
  hash.update(f)
  return hash.digest('hex')
}
