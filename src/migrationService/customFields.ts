import { APIService } from './apiService'

export class CustomFields extends APIService {
  private fields : any

  public async migrate() {
      this.fields = await this.getSourceCustomFileds()
      console.log('fields ', this.fields)
      await this.setTargetCustomFileds()
  }

  // config/preference
  private async getSourceCustomFileds() {
      const { result }  : any = await this.source.get('/custom/fields')
      return result
  }

  private async setTargetCustomFileds() {
      const { result }  : any = await this.target.post('/custom/fields', this.fields)
      console.log('result ', result)
      return result
  }
}