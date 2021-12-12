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
var slideMatch = /^ppt\/slides\/slide/;
var noteMatch = /^ppt\/notesSlides\/notesSlide/;
function _compareSlides(a, b) {
    if (a.slide < b.slide) {
        return -1;
    }
    if (a.slide > b.slide) {
        return 1;
    }
    return 0;
}
function _calculateExtractedText(slideText) {
    var doc = new xmldom_1.DOMParser().parseFromString(slideText), ps = xpath_1.default.select("//*[local-name()='p']", doc);
    var text = '';
    ps.forEach(function (paragraph) {
        var localText = '';
        paragraph = new xmldom_1.DOMParser().parseFromString(paragraph.toString());
        var ts = xpath_1.default.select("//*[local-name()='t' or local-name()='tab' or local-name()='br']", paragraph);
        ts.forEach(function (t) {
            if (t.localName === 't' && t.childNodes.length > 0) {
                localText += t.childNodes[0].data;
            }
            else if (t.localName === 'tab' || t.localName === 'br') {
                localText += '';
            }
        });
        text += "".concat(localText, "\n");
    });
    return text;
}
function extract(filePath, options, cb) {
    var slides = [];
    yauzl_1.default.open(filePath, function (err, zipfile) {
        if (err) {
            (0, util_1.yauzlError)(err, cb);
            return;
        }
        zipfile.on('end', function () {
            var slidesText, text;
            if (slides.length) {
                slides.sort(_compareSlides);
                slidesText = slides.map(function (slide) { return slide.text; }).join('\n');
                text = _calculateExtractedText(slidesText);
                cb(null, text);
            }
            else {
                cb(new Error('Extraction could not find slides in file, are you sure it is the mime type it says it is?'), null);
            }
        });
        zipfile.on('entry', function (entry) {
            if (slideMatch.test(entry.fileName) || noteMatch.test(entry.fileName)) {
                (0, util_1.getTextFromZipFile)(zipfile, entry, function (err2, text) {
                    var slide = +entry.fileName.replace('ppt/slides/slide', '').replace('.xml', '');
                    slides.push({ slide: slide, text: text });
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
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/vnd.openxmlformats-officedocument.presentationml.template',
];
