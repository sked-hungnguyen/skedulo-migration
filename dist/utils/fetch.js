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
exports.Fetch = void 0;
const node_fetch_1 = require("node-fetch");
const fs = require('node:fs');
const { promisify } = require('util');
const { pipeline } = require('stream');
class Fetch {
    constructor(authorizeData) {
        this.authorizeData = authorizeData;
        this.isFormData = false;
    }
    post(urlPath, body = {}, isFormData = false) {
        return __awaiter(this, void 0, void 0, function* () {
            this.isFormData = isFormData;
            return this.request('POST', urlPath, body);
        });
    }
    get(urlPath) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.request('GET', urlPath);
        });
    }
    getFile(urlPath, fileName, savePath = './download') {
        return __awaiter(this, void 0, void 0, function* () {
            yield fs.mkdirSync($, { savePath }, { recursive: true });
            const response = yield (0, node_fetch_1.default)(this.authorizeData.API_SERVER + urlPath, this.getRequestOptions('GET'));
            const streamPipeline = promisify(pipeline);
            // new hash data
            yield streamPipeline(response.body, fs.createWriteStream(`${savePath}/${fileName}`));
        });
    }
    request(method, urlPath, body = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            const options = this.getRequestOptions(method, body);
            return yield (0, node_fetch_1.default)(this.authorizeData.API_SERVER + urlPath, options).then(res => res.json());
        });
    }
    getRequestOptions(method, body = {}) {
        const options = {
            method,
            headers: {
                Authorization: 'Bearer ' + this.authorizeData.TOKEN
            }
        };
        if (method === 'POST') {
            options.body = body;
            if (!this.isFormData) {
                options.headers['Content-Type'] = 'application/json';
                options.body = JSON.stringify(body);
            }
        }
        return options;
    }
}
exports.Fetch = Fetch;
