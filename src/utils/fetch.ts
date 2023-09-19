import fetch from 'node-fetch'
const fs = require('node:fs')
const zlib = require('node:zlib')
const { promisify } = require('util')
const { pipeline } = require('stream')
import { extractTarball, createTarBall } from './tar'

export class Fetch {

  private isFormData : boolean = false

  constructor(private authorizeData: {
    TOKEN: string,
    API_SERVER: string,
    ORG_NAME: string
  }) {}

  async post(urlPath: string, body: object = {}, isFormData : boolean = false) {
    this.isFormData = isFormData
    return this.request('POST', urlPath, body)
  }

  async get(urlPath: string) {
    return this.request('GET', urlPath)
  }

  async getFile(urlPath: string, pkgName: string) {
    const srcPath = './packages'
    await fs.mkdirSync(srcPath, { recursive: true })

    const gzip = await zlib.createGzip()

    const response = await fetch(this.authorizeData.API_SERVER + urlPath, this.getRequestOptions('GET'))

    const streamPipeline = promisify(pipeline)
    //await streamPipeline(response.body, gzip, fs.createWriteStream(`${srcPath}/${pkgName}`))

    await streamPipeline(
      response.body,
      fs.createWriteStream(`${srcPath}/${pkgName}.tar`)
    )

    await extractTarball(`${srcPath}`, `${srcPath}/${pkgName}.tar`),
    await createTarBall(`${srcPath}/${pkgName}`, `${srcPath}/${pkgName}.tar.gz`)
  }

  private async request(method: string, urlPath: string, body: object = {}) {
    const options : any = this.getRequestOptions(method, body)
    if (method === 'POST') {
      options.body = body
      if (!this.isFormData) {
        options.headers['Content-Type'] = 'application/json'
        options.body = JSON.stringify(body)
      }
    }
    return await fetch(this.authorizeData.API_SERVER + urlPath, options).then(res => res.json())
  }

  private getRequestOptions = (method: string, body: object = {}) => ({
    method,
    headers: {
      Authorization: 'Bearer ' + this.authorizeData.TOKEN
    }
  })
}