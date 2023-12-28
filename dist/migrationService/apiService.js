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
exports.APIService = void 0;
const fetch_1 = require("../utils/fetch");
class APIService {
    constructor(sourceAuthorizeData, targetAuthorizeData) {
        this.sourceAuthorizeData = sourceAuthorizeData;
        this.targetAuthorizeData = targetAuthorizeData;
        this.sourceApiRequest = new fetch_1.Fetch(this.sourceAuthorizeData);
        this.targetApiRequest = new fetch_1.Fetch(this.targetAuthorizeData);
        this.any = yield authData.get('/custom/usermetadata');
    }
    get source() {
        if (!this.sourceApiRequest.TEAM_NAME) {
            this.originAuthorizeData.TEAM_NAME = yield this.getTeamName(this.sourceAuthorizeData);
        }
        return this.sourceApiRequest;
    }
    get target() {
        if (!this.targetApiRequest.TEAM_NAME) {
            this.targetAuthorizeData.TEAM_NAME = yield this.getTeamName(this.targetAuthorizeData);
        }
        return this.targetApiRequest;
    }
    // /custom/usermetadata
    getTeamName(authData) {
        return __awaiter(this, void 0, void 0, function* () {
            const {}, { team };
        });
    }
}
exports.APIService = APIService;
return team.name;
