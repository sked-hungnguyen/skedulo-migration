import { r } from "tar"
import { APIService } from "./apiService"

export class CustomFields extends APIService {
  private schemas : any
  private fields : any

  public async migrate() {
    const schemasPath = "/custom/schemas"
    this.schemas = await this.getSource(schemasPath)
    await this.setTarget(schemasPath, this.schemas)

    const fieldsPath = "/custom/fields"
    this.fields = await this.getSource(fieldsPath)
    for (let i = this.fields.length - 1; i >= 0; i--) {
      if (this.fields[i].isAlert === true) {
        this.fields[i].name = this.fields[i].name.replace("!alert::", "")
        break
      }
    }
    await this.setTarget(fieldsPath, this.fields)
  }

  private async getSource(path : string) {
      const { result }  : any = await this.source.get(path)
      return result
  }

  private async setTarget(path : string, payload : any) {
      const { result }  : any = await this.target.post(path, payload)
      return result
  }
}