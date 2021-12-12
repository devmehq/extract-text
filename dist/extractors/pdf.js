"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.types = exports.test = exports.extract = void 0;
var path_1 = __importDefault(require("path"));
var child_process_1 = require("child_process");
var pdf_text_extract_1 = require("../pdf-text-extract");
function extract(filePath, options, cb) {
    // See https://github.com/dbashford/textract/issues/75 for description of
    // what is happening here
    var pdftotextOptions = options.pdftotextOptions || { layout: 'raw' };
    (0, pdf_text_extract_1.extract)(filePath, pdftotextOptions, function (error, pages) {
        if (error) {
            error = new Error("Error extracting PDF text for file at [[ ".concat(path_1.default.basename(filePath), " ]], error: ").concat(error === null || error === void 0 ? void 0 : error.message));
            cb(error, null);
            return;
        }
        var fullText = pages.join(' ').trim();
        cb(null, fullText);
    });
}
exports.extract = extract;
function test(options, cb) {
    (0, child_process_1.exec)('pdftotext -v', function (error, stdout, stderr) {
        var msg;
        if (stderr && stderr.indexOf('pdftotext version') > -1) {
            cb(true);
        }
        else {
            msg = "INFO: 'pdftotext' does not appear to be installed, so textract will be unable to extract PDFs.";
            cb(false, msg);
        }
    });
}
exports.test = test;
exports.types = ['application/pdf'];
