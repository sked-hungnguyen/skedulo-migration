import { APIService } from './apiService'
import { IMigration } from '../interface/migration'

export class OrgPreference extends APIService implements IMigration {
    private preference : any

    public get serviceName() {
        return 'OrgPreference'
      }

    public async migrate() {
        this.preference = await this.getSourcePreference()
        console.log('preference', this.preference)

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