"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomForm = void 0;
const serviceBase_1 = require("./serviceBase");
class CustomForm extends serviceBase_1.AuthorizeBase {
    migration() {
        return __awaiter(this, void 0, void 0, function* () {
            this.forms = yield this.getSourceForms();
        });
    }
    // customform/form
    getSourceForms() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.sourceApiRequest.get('/customform/form');
        });
    }
    // /customform/file/download?form_rev_id=&file_name=
    downloadPackages() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('Start download');
            yield Promise.all(this.forms.result.map((f) => __awaiter(this, void 0, void 0, function* () {
                console.log('Download', pkg.name);
                yield this.sourceApiRequest.getFile(`/pkg/source/${f.formRev.id}/${pkg.source.hash}`, pkg.name);
            })));
            console.log('End downdoad');
        });
    }
}
exports.CustomForm = CustomForm;
//const REQUIRED_FORM_FILES = ['definition.json', 'viewSources.zip', 'main.js.gz', 'main.js.map.gz', 'node.js.gz', 'node.js.map.gz', 'native.js.gz', 'native.js.map.gz']
