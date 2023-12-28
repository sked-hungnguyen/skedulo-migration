import { APIService } from './apiService'
import { IMigration } from '../interface/migration'

export class CustomFields extends APIService implements IMigration {
    private fields : any

    public get serviceName() {
        return 'CustomFields'
      }

    public async migrate() {
        this.fields = await this.getSourceCustomFileds()
        await this.setTargetCustomFileds()
    }

    // config/preference
    private async getSourceCustomFileds() {
        const { result }  : any = await this.source.get('/custom/fields')
        return result
    }

    private async setTargetCustomFileds() {
        return await this.target.post('/custom/fields', this.fields)
    }
}