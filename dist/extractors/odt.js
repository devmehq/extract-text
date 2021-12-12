"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.types = exports.extract = void 0;
var cheerio_1 = __importDefault(require("cheerio"));
var yauzl_1 = __importDefault(require("yauzl"));
var util_1 = require("../util");
function extract(filePath, options, cb) {
    yauzl_1.default.open(filePath, function (err, zipfile) {
        var textOnTheWay = false;
        if (err) {
            (0, util_1.yauzlError)(err, cb);
            return;
        }
        zipfile.on('end', function () {
            if (!textOnTheWay) {
                cb(new Error('Extraction could not find content.xml in file, are you sure it is the mime type it says it is?'), null);
            }
        });
        zipfile.on('entry', function (entry) {
            if (entry.fileName === 'content.xml') {
                textOnTheWay = true;
                (0, util_1.getTextFromZipFile)(zipfile, entry, function (err2, text) {
                    var output = text
                        .replace('inflating: content.xml', '')
                        .replace(/^(.Archive).*/, '')
                        .replace(/text:p/g, 'textractTextNode')
                        .replace(/text:h/g, 'textractTextNode')
                        // remove empty nodes
                        .replace(/<textractTextNode\/>/g, '')
                        // remove empty nodes that have styles
                        .replace(/<textractTextNode[^>]*\/>/g, '')
                        .trim(), $ = cheerio_1.default.load("<body>".concat(output, "</body>")), nodes = $('textractTextNode'), nodeTexts = [];
                    for (var i = 0; i < nodes.length; i++) {
                        nodeTexts.push($(nodes[i]).text());
                    }
                    cb(null, nodeTexts.join('\n'));
                });
            }
        });
        zipfile.on('error', function (err3) {
            cb(err3);
        });
    });
}
exports.extract = extract;
exports.types = [
    'application/vnd.oasis.opendocument.text',
    'application/vnd.oasis.opendocument.text-template',
    'application/vnd.oasis.opendocument.graphics',
    'application/vnd.oasis.opendocument.graphics-template',
    'application/vnd.oasis.opendocument.presentation',
    'application/vnd.oasis.opendocument.presentation-template',
];
