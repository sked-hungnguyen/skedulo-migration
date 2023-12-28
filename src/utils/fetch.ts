import fetch from 'node-fetch'
import { AuthorizeData } from '../interface/migration'
const fs = require('node:fs')
const zlib = require('node:zlib')
const { promisify } = require('util')
const { pipeline } = require('stream')
export class Fetch {

  private isFormData : boolean = false

  constructor(private authorizeData: AuthorizeData) {}

  async post(urlPath: string, body: object = {}, isFormData : boolean = false) {
    this.isFormData = isFormData
    return this.request('POST', urlPath, body)
  }

  async get(urlPath: string) {
    return this.request('GET', urlPath)
  }

  async getFile(urlPath: string, fileName: string, savePath: string = './download', isGz : boolean = false) {

    await fs.mkdirSync(savePath, { recursive: true })

    const gzip = await zlib.createGzip()
    const streamPipeline = promisify(pipeline)

    const response = await fetch(this.authorizeData.API_SERVER + urlPath, this.getRequestOptions('GET'))

    if (!isGz) {
      await streamPipeline(response.body, fs.createWriteStream(`${savePath}/${fileName}`))
    } else {
      await streamPipeline(response.body, gzip, fs.createWriteStream(`${savePath}/${fileName}`))
    }
  }

  private async request(method: string, urlPath: string, body: object = {}) {
    const options = this.getRequestOptions(method, body)
    return await fetch(this.authorizeData.API_SERVER + urlPath, options).then(res => res.json())
  }

  private getRequestOptions(method: string, body: object = {}) {
    const options : { [key: string]: any } = {
      method,
      headers: {
        Authorization: 'Bearer ' + this.authorizeData.TOKEN
      }
    }

    if (method === 'POST') {
      options.body = body
      if (!this.isFormData) {
        options.headers['Content-Type'] = 'application/json'
        options.body = JSON.stringify(body)
      }
    }
    return options
  }
}