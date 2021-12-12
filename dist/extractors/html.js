"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.types = exports.extract = exports.extractFromText = void 0;
/* eslint-disable max-len */
var cheerio_1 = __importDefault(require("cheerio"));
var fs_1 = __importDefault(require("fs"));
function getTextWithAlt($, $element) {
    if (!$element) {
        return '';
    }
    if ($element.is('img')) {
        return " ".concat($element.attr('alt'), " ");
    }
    if ($element.is('input')) {
        return $element.attr('value');
    }
    return $element
        .contents()
        .map(function (i, domElement) {
        var returnText;
        if (domElement.nodeType === 3) {
            returnText = domElement.data;
        }
        else if (domElement.nodeType === 1) {
            $element = $(domElement);
            if ($element.is('img, input') || $element.find('img[alt], input[value]').length > 0) {
                returnText = getTextWithAlt($, $element);
            }
            else {
                returnText = $element.text();
            }
        }
        return returnText;
    })
        .get()
        .join('');
}
function extractFromText(data, options, cb) {
    var $, text;
    text = data
        .toString()
        .replace(/< *(br|p|div|section|aside|button|header|footer|li|article|blockquote|cite|code|h1|h2|h3|h4|h5|h6|legend|nav)((.*?)>)/g, '<$1$2|||||')
        .replace(/< *\/(td|a|option) *>/g, ' </$1>') // spacing some things out so text doesn't get smashed together
        .replace(/< *(a|td|option)/g, ' <$1') // spacing out links
        .replace(/< *(br|hr) +\/>/g, '|||||<$1\\>')
        .replace(/<\/ +?(p|div|section|aside|button|header|footer|li|article|blockquote|cite|code|h1|h2|h3|h4|h5|h6|legend|nav)>/g, '|||||</$1>');
    text = "<textractwrapper>".concat(text, "<textractwrapper>");
    try {
        $ = cheerio_1.default.load(text);
        $('script').remove();
        $('style').remove();
        $('noscript').remove();
        var $docElement = $('textractwrapper');
        if (options.includeAltText) {
            text = getTextWithAlt($, $docElement);
        }
        else {
            text = $docElement.text();
        }
        text = text
            .replace(/\|\|\|\|\|/g, '\n')
            .replace(/(\n\u00A0|\u00A0\n|\n | \n)+/g, '\n')
            .replace(/(\r\u00A0|\u00A0\r|\r | \r)+/g, '\n')
            .replace(/(\v\u00A0|\u00A0\v|\v | \v)+/g, '\n')
            .replace(/(\t\u00A0|\u00A0\t|\t | \t)+/g, '\n')
            .replace(/[\n\r\t\v]+/g, '\n');
    }
    catch (err) {
        cb(err, null);
        return;
    }
    cb(null, text);
}
exports.extractFromText = extractFromText;
function extract(filePath, options, cb) {
    fs_1.default.readFile(filePath, function (error, data) {
        if (error) {
            cb(error, null);
            return;
        }
        extractFromText(data, options, cb);
    });
}
exports.extract = extract;
exports.types = ['text/html', 'text/xml', 'application/xml', 'application/rss+xml', 'application/atom+xml'];
