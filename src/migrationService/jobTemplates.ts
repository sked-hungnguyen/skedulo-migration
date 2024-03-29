import { c } from 'tar'
import { Fetch } from '../utils/fetch'
import { APIService } from './apiService'

interface JobTemplate {
  id: string
  name: string
  schemaName: string
}

interface JobValue {
  id?: string
  templateId?: string
  rel: string
  field: string
  value: string
}

export class JobTemplates extends APIService {
    private sourceJobTemplates : JobTemplate[] = []

     public async migrate() {
        this.sourceJobTemplates = await this.getJobTemplates()
        if (!this.sourceJobTemplates || this.sourceJobTemplates.length == 0) {
          return
        }

        await this.setTargetJobTemplates()
    }

    private async getJobTemplates(f : Fetch = this.source) {
        const { result } : any = await f.get('/config/templates/Jobs')
        const jobTemplates : JobTemplate[] = result as JobTemplate[]

        return jobTemplates
    }

    private async setTargetJobTemplates() {
      const targetTemplates = await this.getJobTemplates(this.target)

      if (targetTemplates) {
        //Check if template already exist
        const customJobTemplates = this.sourceJobTemplates.filter(
          ({ name: sourceName }) => !targetTemplates.some(({ name: targetName }) => sourceName === targetName)
        )

        const newJobTemplatePromises = customJobTemplates.map(async template => {
          return this.target.post('/config/template', template)
        })
        await Promise.all(newJobTemplatePromises)
      }

      //Get new templates contain new templateId
      const newTargetTemplates : JobTemplate[] = await this.getJobTemplates(this.target)

      //Migrate values
      const valuePromise = this.sourceJobTemplates.map(async template => {
        const { result } : any = await this.source.get(`/config/template/${template.id}/values`)
        const values : JobValue[] = result as JobValue[]

        const getMatchingTemplate : any = newTargetTemplates?.find(value => value.name === template.name)
        await this.target.put(`/config/template/${getMatchingTemplate?.id}/values`, values)
      })
      await Promise.all(valuePromise)
    }
}