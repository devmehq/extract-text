"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.types = exports.test = exports.extract = void 0;
var child_process_1 = require("child_process");
var os_1 = __importDefault(require("os"));
var path_1 = __importDefault(require("path"));
var util_1 = require("../util");
function extract(filePath, options, cb) {
    var execOptions = (0, util_1.createExecOptions)('doc', options);
    (0, child_process_1.exec)("antiword -m UTF-8.txt \"".concat(filePath, "\""), execOptions, function (error, stdout) {
        var err;
        if (error) {
            if (error.toString().indexOf('is not a Word Document') > 0) {
                err = new Error("file named [[ ".concat(path_1.default.basename(filePath), " ]] does not appear to really be a .doc file"));
            }
            else {
                err = new Error("antiword read of file named [[ ".concat(path_1.default.basename(filePath), " ]] failed: ").concat(error));
            }
            cb(err, null);
        }
        else {
            cb(null, stdout
                .toString()
                .trim()
                .replace(/\[pic\]/g, ''));
        }
    });
}
exports.extract = extract;
function test(options, cb) {
    // just non-osx extractor
    if (os_1.default.platform() === 'darwin') {
        cb(true);
        return;
    }
    var execOptions = (0, util_1.createExecOptions)('doc', options);
    (0, child_process_1.exec)("antiword -m UTF-8.txt ".concat(__filename), execOptions, function (error /* , stdout, stderr */) {
        var msg;
        if (error !== null && error.message && error.message.indexOf('not found') !== -1) {
            msg = "INFO: 'antiword' does not appear to be installed, so textract will be unable to extract DOCs.";
            cb(false, msg);
        }
        else {
            cb(true);
        }
    });
}
exports.test = test;
var types;
exports.types = types;
if (os_1.default.platform() === 'darwin') {
    // types = ['application/msword'];
}
else {
    exports.types = types = ['application/msword'];
}
