import { Fetch } from '../utils/fetch'
import { APIService } from './apiService'

export class Webhook extends APIService {
  private sourceWebhooks : any

  public async migrate() {
    this.sourceWebhooks = await this.getWebhooks()
    if (!this.sourceWebhooks || this.sourceWebhooks.length == 0) {
      return
    }

    await this.setTargetWebhook()
  }

  private async getWebhooks(f : Fetch = this.source) {
      const { result } : any = await f.get('/webhooks')
      return result
  }

  private async setTargetWebhook() {
    const targetWebhooks : any = await this.getWebhooks(this.target)

    if (targetWebhooks) {
      //Check if webhook already exist to delete
      const exitedWebhooks = targetWebhooks.filter(
        (source : any) => this.sourceWebhooks.some((target : any) => source.name === target.name)
      )

      const deleteExistedWebhooks = exitedWebhooks.map(async (webhook : any) => {
        return this.target.delete(`/webhooks/${webhook.id}`)
      })
      await Promise.all(deleteExistedWebhooks)
    }

    // Migrate webhooks
    const webhookPromise = this.sourceWebhooks.map(async (webhook : any) => {
      await this.target.post(`/webhooks`, webhook)
    })
    await Promise.all(webhookPromise)
  }
}