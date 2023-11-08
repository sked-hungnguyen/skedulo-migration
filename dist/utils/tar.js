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
exports.getFileHash = exports.createTarBall = exports.extractTarball = void 0;
const tar = require("tar");
const crypto = require("crypto");
const fs = require("fs");
function extractTarball(destFolder, tarball) {
    return __awaiter(this, void 0, void 0, function* () {
        yield fs.mkdirSync(destFolder, { recursive: true });
        console.log('Extract ', destFolder, ' ', tarball);
        return tar.x({
            cwd: destFolder,
            file: tarball
        });
    });
}
exports.extractTarball = extractTarball;
function createTarBall(destFolder, destFile) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('Tar ', destFolder, ' ', destFile);
        return tar
            .c({
            file: destFile,
            cwd: destFolder,
            gzip: true
        }, ['.'])
            .then(() => destFile);
    });
}
exports.createTarBall = createTarBall;
function getFileHash(file) {
    const hash = crypto.createHash('sha256');
    const f = fs.readFileSync(file);
    hash.update(f);
    return hash.digest('hex');
}
exports.getFileHash = getFileHash;
