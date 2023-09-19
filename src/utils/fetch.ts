import fetch from 'node-fetch'
const fs = require('node:fs')
const zlib = require('node:zlib')
const { promisify } = require('util')
const { pipeline } = require('stream')

export class Fetch {

  constructor(private authorizeData: {
    TOKEN: string,
    API_SERVER: string,
    ORG_NAME: string
  }) {}

  async post(urlPath: string, body: object = {}) {
    return this.request('POST', urlPath, body)
  }

  async get(urlPath: string) {
    return this.request('GET', urlPath)
  }

  async getFile(urlPath: string, pkgName: string) {
    const srcPath = './packages'
    await fs.mkdirSync(srcPath, { recursive: true })

    const gzip = await zlib.createGzip()

    // await fetch(this.authorizeData.API_SERVER + urlPath, this.getRequestOptions('GET')).then(res => {
    //    res.body?.pipe(gzip).pipe(fs.createWriteStream(`${srcPath}/${pkgName}`));
    // })

    const response = await fetch(this.authorizeData.API_SERVER + urlPath, this.getRequestOptions('GET'))

    const streamPipeline = promisify(pipeline)
    await streamPipeline(response.body, gzip, fs.createWriteStream(`${srcPath}/${pkgName}`))
  }

  private async request(method: string, urlPath: string, body: object = {}) {
    return fetch(this.authorizeData.API_SERVER + urlPath, this.getRequestOptions(method, body)).then(res => res.json())
  }

  private getRequestOptions = (method: string, body: object = {}) => ({
    method,
    headers: {
      Authorization: 'Bearer ' + this.authorizeData.TOKEN
    },
    body: method !== 'GET' ? body : undefined
  })
}