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
var html_1 = require("./html");
function extract(filePath, options, cb) {
    var execOptions = (0, util_1.createExecOptions)('rtf', options), escapedPath = filePath.replace(/\s/g, '\\ ');
    // Going to output html from unrtf because unrtf does a great job of
    // going to html, but does a crap job of going to text. It leaves sections
    // out, strips apostrophes, leaves nasty quotes in for bullets and more
    // that I've likely not yet discovered.
    //
    // textract can go from html to text on its own, so let unrtf go to html
    // then extract the text from that
    //
    // Also do not have to worry about stripping comments from unrtf text
    // output since HTML comments are not included in output. Also, the
    // unrtf --quiet option doesn't work.
    (0, child_process_1.exec)("unrtf --html --nopict ".concat(escapedPath), execOptions, function (error, stdout /* , stderr */) {
        var err;
        if (error) {
            err = new Error("unrtf read of file named [[ ".concat(path_1.default.basename(filePath), " ]] failed: ").concat(error));
            cb(err, null);
        }
        else {
            (0, html_1.extractFromText)(stdout.toString().trim(), {}, cb);
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
    (0, child_process_1.exec)("unrtf ".concat(__filename), function (error /* , stdout, stderr */) {
        var msg;
        if (error !== null && error.message && error.message.indexOf('not found') !== -1) {
            msg = "INFO: 'unrtf' does not appear to be installed, so textract will be unable to extract RTFs.";
            cb(false, msg);
        }
        else {
            cb(true);
        }
    });
}
exports.test = test;
var types = [];
exports.types = types;
// rely on native tools on osx
if (os_1.default.platform() === 'darwin') {
    // types = ['application/rtf', 'text/rtf'];
}
else {
    exports.types = types = ['application/rtf', 'text/rtf'];
}
