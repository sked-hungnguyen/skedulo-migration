import { Fetch } from '../utils/fetch'
import { APIService } from './apiService'

interface JobType {
  value: string
  label: string
  active: boolean
  defaultValue: boolean
}

export class JobTypes extends APIService {
    private jobTypes : JobType[] = []

    public async migrate() {
        this.jobTypes = await this.getJobTypes()
        await this.setTargetJobTypes()
    }

    // config/preference
    private async getJobTypes(f : Fetch = this.source) {
        const { result }  : any  = await f.get('/custom/vocabulary/Jobs/Type')
        const jobTypes : JobType[] = result as JobType[]
        return jobTypes
    }

    private async setTargetJobTypes() {
      const targetJobTypes = await this.getJobTypes(this.target)

      if (targetJobTypes) {
        const customJobTypes = this.jobTypes.filter(
          ({ value: sourceValue }) => !targetJobTypes.some(({ value: targetValue }) => sourceValue === targetValue)
        )

        Promise.all(
          customJobTypes.map(customJobType => this.target.post('/custom/vocabulary/Jobs/Type', customJobType))
        )
      }
    }
}