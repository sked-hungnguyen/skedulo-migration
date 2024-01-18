import { APIService } from "./apiService"
import { FormData } from "formdata-node"
import { fileFromPath } from "formdata-node/file-from-path"
const fs = require("node:fs")

export class CustomForm extends APIService {
  private REQUIRED_FORM_FILES = ["definition.json", "viewSources.zip", "main.js.gz", "main.js.map.gz", "node.js.gz", "node.js.map.gz", "native.js.gz", "native.js.map.gz"]
  private downloadPath = "./download/forms"
  private customForm : any

  public async migrate() {
    this.customForm = await this.getSourceForms()
    console.log("Custom form", this.customForm)

    if (!this.customForm || this.customForm.length == 0) {
      return
    }

    await this.downloadForms()

    await this.deployForms()
  }

  // customform/form
  private async getSourceForms() {
      return await this.source.get("/customform/form")
  }

  // /customform/file/download?form_rev_id=&file_name=
  private async downloadForms() {
    console.log("Start download form")
      await Promise.all(this.customForm.result.map(async (form : any) => {
        const savePath = `${this.downloadPath}/${form.formRev.formId}`
        const definition = form.formRev.definition
        const formName = definition.forms[0].name

        await fs.mkdirSync(savePath, { recursive: true })
        await fs.writeFileSync(`${savePath}/definition.json`, JSON.stringify(definition));
        console.log(`Download form: ${formName}`)
        await Promise.all(form.formRev.files.map(async (fileName : string) => {
          const isGz = fileName !== "viewSources.zip"
          const fn = isGz ? `${fileName}.gz` : fileName
          console.log(`Get file: ${formName} - ${fn}`)
          await this.source.getFile(`/customform/file/download?form_rev_id=${form.formRev.id}&file_name=${fileName}`, fn, savePath, isGz)
          console.log(`Get file: ${formName} - ${fn} done`)
        }))
      }))
    console.log("End downdoad form")
  }

  // /centrifuge/util/deploy-form
  private async deployForms() {
    console.log("Start deploy form")
    await Promise.all(this.customForm.result.map(async (form : any) => {
      const formPath = `${this.downloadPath}/${form.formRev.formId}`
      const definition = form.formRev.definition
      const formName = definition.forms[0].name

      console.log(`Deploy form: ${formName}`)
      // Create form definition
      const { created } : any = await this.target.post("/customform/form", { name: formName})

      if (!created.id) {
        console.log(`Create form ${formName} failed`)
        return
      }
      const formId = created.id
      const formData = new FormData()
      await Promise.all(this.REQUIRED_FORM_FILES.map(async (fileName : string) => {
        formData.append("attachments", await fileFromPath(`${formPath}/${fileName}`, fileName))
      }))

      const r : any = await this.target.post(`/customform/file/upload/${formId}`, formData, true)
      console.log(`Deploy ${formName} result `, r)

      if (formId && form.jobTypes && form.jobTypes.length > 0) {
        await Promise.all(form.jobTypes.map(async (jobTypeName : String) => {
          console.log(`Link form: ${formName} to job type: ${jobTypeName} `)
          await this.linkForms(formId, jobTypeName)
        }))
      } else {
        console.log("Deploy form failed")
      }
    }))
    console.log("End deploy form")
  }

  // /customform/link_form
  private async linkForms(formId : String, jobTypeName : String) {
    await this.target.post("/customform/link_form", { formId, jobTypeName })
  }
}