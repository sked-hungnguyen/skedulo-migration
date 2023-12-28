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
const apiService_1 = require("./apiService");
const fs = require('node:fs');
const tar_1 = require("./tar");
class CustomForm extends apiService_1.APIService {
    constructor() {
        super(...arguments);
        this.downloadPath = './download/forms';
    }
    get serviceName() {
        return 'CustomForm';
    }
    migrate() {
        return __awaiter(this, void 0, void 0, function* () {
            this.customForm = yield this.getSourceForms();
            yield this.downloadForms();
            yield this.deployForms();
        });
    }
    // customform/form
    getSourceForms() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.source.get('/customform/form');
        });
    }
    // /customform/file/download?form_rev_id=&file_name=
    downloadForms() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('Start download');
            yield Promise.all(this.customForm.result.map((form) => __awaiter(this, void 0, void 0, function* () {
                const savePath = `${this.downloadPath}/${form.formRev.formId}`;
                const definition = form.formRev.definition;
                const formName = definition.forms[0].name;
                yield fs.writeFileSync(`${savePath}/definition.json`, JSON.stringify(definition));
                yield Promise.all(form.formRev.files.map((fileName) => __awaiter(this, void 0, void 0, function* () {
                    console.log(`Download ${formName} - ${fileName}`);
                    yield this.source.getFile(`/customform/file/download?form_rev_id${form.formRev.id}&file_name=${fileName}`, fileName, savePath);
                })));
                yield (0, tar_1.createTarBall)($, { savePath }, `${this.downloadPath}/${form.formRev.formId}.tar.gz`);
            })));
            console.log('End downdoad');
        });
    }
    // /centrifuge/util/deploy-form
    deployForms() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('Start deploy');
            yield Promise.all(this.customForm.result.map((form) => __awaiter(this, void 0, void 0, function* () {
                var _a;
                const formFilePath = `${this.downloadPath}/${form.formRev.formId}.tar.gz`;
                const definition = form.formRev.definition;
                const formName = definition.forms[0].name;
                const formData = new FormData();
                formData.set('file', yield fileFromPath(formFilePath));
                console.log('Deploy ', formName);
                const { result } = yield this.target.post('/centrifuge/util/deploy-form', formData, true);
                console.log('Deploy result ', result);
                const formId = ((_a = result === null || result === void 0 ? void 0 : result.created) === null || _a === void 0 ? void 0 : _a.formId) || '';
                if (formId) {
                    console.log('Deploy success - link form');
                    yield Promise.all(definition.jobTypes.forEach((jobTypeName) => __awaiter(this, void 0, void 0, function* () {
                        yield this.linkForms(formId, jobTypeName);
                    })));
                }
                else {
                    console.log('Deploy failed');
                }
            })));
            console.log('End deploy');
        });
    }
    // /customform/link_form
    linkForms(formId, jobTypeName) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.target.post('/customform/link_form', { formId, jobTypeName });
        });
    }
}
exports.CustomForm = CustomForm;
//const REQUIRED_FORM_FILES = ['definition.json', 'viewSources.zip', 'main.js.gz', 'main.js.map.gz', 'node.js.gz', 'node.js.map.gz', 'native.js.gz', 'native.js.map.gz']
