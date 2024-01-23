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
exports.Package = void 0;
const apiService_1 = require("./apiService");
const tar_1 = require("../utils/tar");
const formdata_node_1 = require("formdata-node");
const file_from_path_1 = require("formdata-node/file-from-path");
const tar_2 = require("./tar");
class Package extends apiService_1.APIService {
    constructor() {
        super(...arguments);
        this.downloadPath = './download/packages';
    }
    get serviceName() {
        return 'Package';
    }
    migrate() {
        return __awaiter(this, void 0, void 0, function* () {
            this.packages = yield this.getPackages();
            yield this.downloadPackages();
            yield this.deployPackages();
            yield this.buildPkg();
            yield this.checkBuildInstallPkg();
        });
    }
    // pkg/installed
    getPackages() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.source.get('/pkg/installed');
        });
    }
    // pkg/source/:name/:hash
    downloadPackages() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('Start download');
            const savePath = `${this.downloadPath}/tar`;
            yield Promise.all(this.packages.result.map((pkg) => __awaiter(this, void 0, void 0, function* () {
                console.log('Download', pkg.name);
                yield this.source.getFile(`/pkg/source/${pkg.name}/${pkg.source.hash}`, `${pkg.name}.tar`, savePath);
                yield (0, tar_2.extractTarball)(`${savePath}/${pkg.name}`, `${savePath}/${pkg.name}.tar`);
                yield (0, tar_2.createTarBall)(`${savePath}/${pkg.name}`, `${this.downloadPath}/${pkg.name}.tar.gz`);
            })));
            console.log('End downdoad');
        });
    }
    // /pkg/source/:name
    deployPackages() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('Start deploy');
            yield Promise.all(this.packages.result.map((pkg) => __awaiter(this, void 0, void 0, function* () {
                const pkgFilePath = `${this.downloadPath}/${pkg.name}.tar.gz`;
                const formData = new formdata_node_1.FormData();
                formData.set('source', yield (0, file_from_path_1.fileFromPath)(pkgFilePath));
                formData.set('name', pkg.name);
                formData.set('hash', (0, tar_1.getFileHash)(pkgFilePath));
                formData.set('metadata', JSON.stringify(pkg.metadata));
                console.log('Deploy ', pkg.name);
                const { result } = yield this.target.post(`/pkg/source/${pkg.name}`, formData, true);
                console.log('Deploy result ', result);
                const { name, hash } = result;
                if (name && hash) {
                    pkg.newHash = hash;
                    this.logger.log({
                        level: 'info',
                        message: `${this.target.TEAM_NAME} ${name} Upload success!`
                    });
                }
            })));
            console.log('End deploy');
        });
    }
    // /pkgr/build
    buildPkg() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('Start build');
            yield Promise.all(this.packages.result.map((pkg) => __awaiter(this, void 0, void 0, function* () {
                const body = {
                    name: pkg.name,
                    hash: pkg.newHash,
                    action: 'deploy'
                };
                console.log('Build ', pkg.name);
                const { result } = yield this.targetApiRequest.post('/pkgr/build', body);
                console.log('Build result ', result);
                const { id: buildId } = result;
                pkg.buildId = buildId;
                this.logger.log({
                    level: 'info',
                    message: `${this.target.TEAM_NAME} ${pkg.name} startBuild success!`
                });
            })));
            console.log('End build');
        });
    }
    checkBuildInstallPkg() {
        return __awaiter(this, void 0, void 0, function* () {
            let checkCount = 0;
            const checkBuild = setInterval(() => __awaiter(this, void 0, void 0, function* () {
                console.log('Start check build ', checkCount);
                yield Promise.all(this.packages.result.filter((pkg) => (!pkg.checkTime && pkg.checkTime < 3) || !pkg.passed).map((pkg) => __awaiter(this, void 0, void 0, function* () {
                    if (!pkg.checkTime) {
                        pkg.checkTime = 0;
                    }
                    pkg.checkTime += 1;
                    console.log('Check build ', pkg.name, ' - ', pkg.checkTime);
                    const { status } = yield this.getBuildStatus(pkg.buildId);
                    console.log(`running interval check - ${pkg.name} build status is`, status);
                    if (status == 'Passed') {
                        pkg.passed = true;
                        checkCount++;
                        console.log('Install ', pkg.name);
                        const result = yield this.targetApiRequest.post(`/pkgr/build/install/${pkg.buildId}`);
                        console.log('Install result ', result);
                    }
                    if (pkg.checkTime == 3 || status == 'Failed') {
                        this.logger.log({
                            level: 'error',
                            message: `${this.target.TEAM_NAME} ${pkg.name} build failed!`
                        });
                        checkCount++;
                    }
                    if (checkCount >= this.packages.result.length) {
                        clearInterval(checkBuild);
                    }
                })));
                console.log('End check build ', checkCount);
            }), 1000 * 60);
        });
    }
    getBuildStatus(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const { result } = yield this.targetApiRequest.get(`/pkg/builds/${id}`);
            return result;
        });
    }
}
exports.Package = Package;
