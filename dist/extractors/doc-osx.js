"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.types = exports.test = exports.extract = void 0;
var child_process_1 = require("child_process");
var os_1 = __importDefault(require("os"));
var path_1 = __importDefault(require("path"));
// textutil -convert txt -stdout foo.doc
function extract(filePath, options, cb) {
    var result = '';
    var error = null;
    var textutil = (0, child_process_1.spawn)('textutil', ['-convert', 'txt', '-stdout', filePath]);
    textutil.stdout.on('data', function (buffer) {
        result += buffer.toString();
    });
    textutil.stderr.on('error', function (buffer) {
        if (!error) {
            error = '';
        }
        error += buffer.toString();
    });
    textutil.on('close', function ( /* code */) {
        if (result === 'not a doc') {
            cb(result, null);
            return;
        }
        if (error) {
            error = new Error("textutil read of file named [[ ".concat(path_1.default.basename(filePath), " ]] failed: ").concat(error));
            cb(error, null);
            return;
        }
        cb(null, result.trim());
    });
}
exports.extract = extract;
function test(options, cb) {
    // just osx extractor, so don't bother checking on osx
    if (os_1.default.platform() !== 'darwin') {
        cb(true);
        return;
    }
    (0, child_process_1.exec)("textutil ".concat(__filename), function (error /* , stdout, stderr */) {
        var msg;
        if (error !== null) {
            msg = "INFO: 'textutil' does not appear to be installed,so textract will be unable to extract DOCs.";
        }
        cb(error === null, msg);
    });
}
exports.test = test;
var types = [];
exports.types = types;
if (os_1.default.platform() === 'darwin') {
    exports.types = types = ['application/msword', 'application/rtf', 'text/rtf'];
    // types = [];
}
