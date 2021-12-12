"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.types = exports.test = exports.extract = void 0;
var child_process_1 = require("child_process");
var path_1 = __importDefault(require("path"));
var util_1 = require("../util");
function extract(filePath, options, cb) {
    var execOptions = (0, util_1.createExecOptions)('dxf', options), escapedPath = filePath.replace(/\s/g, '\\ ');
    (0, child_process_1.exec)("drawingtotext ".concat(escapedPath), execOptions, function (error, stdout, stderr) {
        if (stderr.toString() !== '') {
            error = new Error("error extracting DXF text ".concat(path_1.default.basename(filePath), ": ").concat(stderr));
            cb(error, null);
            return;
        }
        cb(null, stdout);
    });
}
exports.extract = extract;
function test(options, cb) {
    (0, child_process_1.exec)('drawingtotext notalegalfile', function (error, stdout, stderr) {
        var errorRegex = /I couldn't make sense of your input/;
        if (!(stderr && errorRegex.test(stderr))) {
            var msg = "INFO: 'drawingtotext' does not appear to be installed, so textract will be unable to extract DXFs.";
            cb(false, msg);
        }
        else {
            cb(true);
        }
    });
}
exports.test = test;
exports.types = [
    'application/dxf',
    'application/x-autocad',
    'application/x-dxf',
    'drawing/x-dxf',
    'image/vnd.dxf',
    'image/x-autocad',
    'image/x-dxf',
    'zz-application/zz-winassoc-dxf',
];
