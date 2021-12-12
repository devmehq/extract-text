"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.types = exports.extract = void 0;
var xpath_1 = __importDefault(require("xpath"));
var xmldom_1 = require("xmldom");
var yauzl_1 = __importDefault(require("yauzl"));
var util_1 = require("../util");
var includeRegex = /.xml$/;
var excludeRegex = /^(word\/media\/|word\/_rels\/)/;
function _calculateExtractedText(inText, preserveLineBreaks) {
    var doc = new xmldom_1.DOMParser().parseFromString(inText), ps = xpath_1.default.select("//*[local-name()='p']", doc);
    var text = '';
    ps.forEach(function (paragraph) {
        var localText = '';
        paragraph = new xmldom_1.DOMParser().parseFromString(paragraph.toString());
        var ts = xpath_1.default.select("//*[local-name()='t' or local-name()='tab' or local-name()='br']", paragraph);
        ts.forEach(function (t) {
            if (t.localName === 't' && t.childNodes.length > 0) {
                localText += t.childNodes[0].data;
            }
            else if (t.localName === 'tab') {
                localText += ' ';
            }
            else if (t.localName === 'br') {
                if (preserveLineBreaks !== true) {
                    localText += ' ';
                }
                else {
                    localText += '\n';
                }
            }
        });
        text += "".concat(localText, "\n");
    });
    return text;
}
function extract(filePath, options, cb) {
    var result = '';
    yauzl_1.default.open(filePath, function (err, zipfile) {
        var processedEntries = 0;
        if (err) {
            (0, util_1.yauzlError)(err, cb);
            return;
        }
        var processEnd = function () {
            var text;
            processedEntries += 1;
            if (zipfile.entryCount === processedEntries) {
                if (result.length) {
                    text = _calculateExtractedText(result, options.preserveLineBreaks);
                    cb(null, text);
                }
                else {
                    cb(new Error('Extraction could not find content in file, are you sure it is the mime type it says it is?'), null);
                }
            }
        };
        zipfile.on('entry', function (entry) {
            if (includeRegex.test(entry.fileName) && !excludeRegex.test(entry.fileName)) {
                (0, util_1.getTextFromZipFile)(zipfile, entry, function (err2, text) {
                    result += "".concat(text, "\n");
                    processEnd();
                });
            }
            else {
                processEnd();
            }
        });
        zipfile.on('error', function (err3) {
            cb(err3);
        });
    });
}
exports.extract = extract;
exports.types = ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
