
import { Fetch } from '../utils/fetch'
import { AuthorizeData } from '../interface/migration'
import * as winston from 'winston'

export class APIService {
  private static svcInstance : APIService

  private sourceApiRequest: Fetch = this.authorizeData.apiService ? this.authorizeData.apiService.sourceApiRequest : new Fetch(this.authorizeData.source)
  private targetApiRequest: Fetch = this.authorizeData.apiService ? this.authorizeData.apiService.targetApiRequest : new Fetch(this.authorizeData.target)

  constructor(public authorizeData : any) {}

  public static async init(authorizeData : any) {
    if (!APIService.svcInstance) {
      APIService.svcInstance = new APIService(authorizeData)
    }
    await APIService.svcInstance.loadTeamName()

    return APIService.svcInstance
  }

  public get source() {
    return this.sourceApiRequest
  }

  public get target() {
    return this.targetApiRequest
  }

  private async loadTeamName() {
    if (!this.authorizeData.source.TEAM_NAME) {
      this.authorizeData.source.TEAM_NAME = await this.getTeamName(this.sourceApiRequest)
    }
    if (!this.authorizeData.target.TEAM_NAME) {
      this.authorizeData.target.TEAM_NAME = await this.getTeamName(this.targetApiRequest)
    }
  }

  // /custom/usermetadata
  private async getTeamName(f : Fetch ) {
      const { result } : any = await f.get('/custom/usermetadata')
      return result?.team?.name
  }

  public logger = winston.createLogger({
    format: winston.format.json(),
    defaultMeta: { service: 'user-service' },
    transports: [
      new winston.transports.File({ filename: 'error.log', level: 'error' }),
      new winston.transports.File({ filename: 'combined.log' }),
    ]
  });
}