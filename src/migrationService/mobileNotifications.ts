import { Fetch } from '../utils/fetch'
import { APIService } from './apiService'

export class MobileNotifications extends APIService {
  private templates = [ 'job_dispatch', 'job_reminder', 'job_cancelled', 'job_offer' ]
  private templateTypes = [ 'sms', 'push' ]

  private sourceMobileNotifications : any

  public async migrate() {
    this.sourceMobileNotifications = await this.getMobileNotifications()
    if (!this.sourceMobileNotifications || this.sourceMobileNotifications.length == 0) {
      return
    }

    await this.setMobileNotifications()
  }

  private async getMobileNotifications(f : Fetch = this.source) {
      const { result } : any = await f.get('/notifications/v2/templates')
      return result
  }

  private async setMobileNotifications() {

    // Delete all target custom mobile notifications
    await Promise.all(this.templates.map(async (template : any) => {
      await Promise.all(this.templateTypes.map(async (templateType : any) => {
        await this.target.delete(`/notifications/v2/template/${template}/${templateType}`)
      }))
    }))

    // Migrate custom mobile notifications
    const mobileNotificationPromise = this.sourceMobileNotifications.map(async (mobileNotification : any) => {
      await this.target.post(`/notifications/v2/template/${mobileNotification.type}/${mobileNotification.protocol}`, { template: mobileNotification.template.text})
    })
    await Promise.all(mobileNotificationPromise)
  }
}