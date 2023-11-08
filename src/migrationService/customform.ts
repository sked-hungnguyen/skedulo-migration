import { AuthorizeBase } from './serviceBase'

export class CustomForm extends AuthorizeBase {
    private forms : any

    async migration() {
        this.forms = await this.getSourceForms()
    }

    // customform/form
    private async getSourceForms() {
        return await this.sourceApiRequest.get('/customform/form')
    }

    // /customform/file/download?form_rev_id=&file_name=
    private async downloadPackages() {
    console.log('Start download')
    await Promise.all(this.forms.result.map(async (f : any) => {
      console.log('Download', pkg.name)
      await this.sourceApiRequest.getFile(`/pkg/source/${f.formRev.id}/${pkg.source.hash}`, pkg.name)
    }))
    console.log('End downdoad')
  }
}

//const REQUIRED_FORM_FILES = ['definition.json', 'viewSources.zip', 'main.js.gz', 'main.js.map.gz', 'node.js.gz', 'node.js.map.gz', 'native.js.gz', 'native.js.map.gz']