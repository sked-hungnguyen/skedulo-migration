import { APIService } from './apiService'

export class OrgPreference extends APIService {
  private preference : any

  public async migrate() {
      this.preference = await this.getSourcePreference()
      await this.setTargetPreference()
  }

  // config/preference
  private async getSourcePreference() {
      const { result } : any = await this.source.get('/config/org_preference')
      return result
  }

  private async setTargetPreference() {
      return await this.target.post('/config/org_preference', this.preference)
  }
}