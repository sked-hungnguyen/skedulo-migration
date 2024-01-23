import { Fetch } from '../utils/fetch'
import { APIService } from './apiService'

export class TriggerActions extends APIService {
  private sourceTriggerActions : any

  public async migrate() {
    this.sourceTriggerActions = await this.getTriggerActions()
    if (!this.sourceTriggerActions || this.sourceTriggerActions.length == 0) {
      return
    }

    await this.setTargetTriggerAction()
  }

  private async getTriggerActions(f : Fetch = this.source) {
      const { result } : any = await f.get('/triggered_actions')
      return result
  }

  private async setTargetTriggerAction() {
    const targetTriggerActions : any = await this.getTriggerActions(this.target)

    if (targetTriggerActions) {
      // Check if Trigger Actions already exist to delete
      const exitedTriggerActions = targetTriggerActions.filter(
        (source : any) => this.sourceTriggerActions.some((target : any) => source.name === target.name)
      )

      const deleteExistedTriggerActions = exitedTriggerActions.map(async (triggerAction : any) => {
        return this.target.delete(`/triggered_actions/${triggerAction.id}`)
      })
      await Promise.all(deleteExistedTriggerActions)
    }

    // Migrate TriggerActions
    const triggerActionPromise = this.sourceTriggerActions.map(async (triggerAction : any) => {
      await this.target.post(`/triggered_actions`, triggerAction)
    })
    await Promise.all(triggerActionPromise)
  }
}