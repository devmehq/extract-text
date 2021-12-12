"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.types = exports.test = exports.extract = void 0;
var child_process_1 = require("child_process");
var util_1 = require("../util");
function tesseractExtractionCommand(options, inputFile, outputFile) {
    var cmd = "tesseract ".concat(inputFile, " ").concat(outputFile);
    if (options.tesseract) {
        if (options.tesseract.lang) {
            cmd += " -l ".concat(options.tesseract.lang);
        }
        else if (options.tesseract.cmd) {
            cmd += " ".concat(options.tesseract.cmd);
        }
    }
    cmd += ' quiet';
    return cmd;
}
function extract(filePath, options, cb) {
    var execOptions = (0, util_1.createExecOptions)('images', options);
    (0, util_1.runExecIntoFile)('tesseract', filePath, options, execOptions, tesseractExtractionCommand, cb);
}
exports.extract = extract;
function test(options, cb) {
    (0, child_process_1.exec)('tesseract', function (error, stdout, stderr) {
        var msg;
        // checking for content of help text
        if ((error && error.toString().indexOf('Usage:') > -1) ||
            (stderr && stderr.toString().indexOf('Usage:') > -1) ||
            (stdout && stdout.toString().indexOf('Usage:') > -1)) {
            cb(true);
        }
        else {
            msg = "INFO: 'tesseract' does not appear to be installed, so textract will be unable to extract images.";
            cb(false, msg);
        }
    });
}
exports.test = test;
exports.types = ['image/png', 'image/jpeg', 'image/gif'];
