import { Fetch } from '../utils/fetch'

export class APIService {
  private static svcInstance : APIService

  private sourceApiRequest: Fetch = this.svcData.apiService ? this.svcData.apiService.sourceApiRequest : new Fetch(this.svcData.source)
  private targetApiRequest: Fetch = this.svcData.apiService ? this.svcData.apiService.targetApiRequest : new Fetch(this.svcData.target)

  constructor(public svcData : any) {}

  public static async init(svcData : any) {
    if (!APIService.svcInstance) {
      APIService.svcInstance = new APIService(svcData)
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
    if (!this.svcData.source.TEAM_NAME) {
      this.svcData.source.TEAM_NAME = await this.getTeamName(this.sourceApiRequest)
    }
    if (!this.svcData.target.TEAM_NAME) {
      this.svcData.target.TEAM_NAME = await this.getTeamName(this.targetApiRequest)
    }
  }

  // /custom/usermetadata
  private async getTeamName(f : Fetch ) {
      const { result } : any = await f.get('/custom/usermetadata')
      return result?.team?.name
  }
}