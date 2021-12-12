"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.extract = void 0;
var fs_1 = __importDefault(require("fs"));
var path_1 = __importDefault(require("path"));
var html_entities_1 = require("html-entities");
var util_1 = require("./util");
var extractorPath = path_1.default.join(__dirname, 'extractors');
var typeExtractors = {};
var regexExtractors = [];
var failedExtractorTypes = {};
var STRIP_ONLY_SINGLE_LINEBREAKS = /(^|[^\n])\n(?!\n)/g;
var WHITELIST_PRESERVE_LINEBREAKS = /[^A-Za-z\x80-\xFF\x24\u20AC\xA3\xA5 0-9 \u2015\u2116\u2018\u2019\u201C|\u201D\u2026 \uFF0C \u2013 \u2014 \u00C0-\u1FFF \u2C00-\uD7FF \uFB50–\uFDFF \uFE70–\uFEFF \uFF01-\uFFE6 .,?""!@#$%^&*()-_=+;:<>/\\|}{[\]`~'-\w\n\r]*/g, WHITELIST_STRIP_LINEBREAKS = /[^A-Za-z\x80-\xFF\x24\u20AC\xA3\xA5 0-9 \u2015\u2116\u2018\u2019\u201C|\u201D\u2026 \uFF0C \u2013 \u2014 \u00C0-\u1FFF \u2C00-\uD7FF \uFB50–\uFDFF \uFE70–\uFEFF \uFF01-\uFFE6 .,?""!@#$%^&*()-_=+;:<>/\\|}{[\]`~'-\w]*/g;
var totalExtractors = 0, satisfiedExtractors = 0, hasInitialized = false;
function registerExtractor(extractor) {
    if (extractor.types) {
        extractor.types.forEach(function (type) {
            if (typeof type === 'string') {
                type = type.toLowerCase();
                typeExtractors[type] = extractor.extract;
            }
            else if (type instanceof RegExp) {
                regexExtractors.push({ reg: type, extractor: extractor.extract });
            }
        });
    }
}
function registerFailedExtractor(extractor, failedMessage) {
    if (extractor.types) {
        extractor.types.forEach(function (type) {
            failedExtractorTypes[type.toLowerCase()] = failedMessage;
        });
    }
}
function testExtractor(extractor, options) {
    extractor.test(options, function (passedTest, failedMessage) {
        satisfiedExtractors++;
        if (passedTest) {
            registerExtractor(extractor);
        }
        else {
            registerFailedExtractor(extractor, failedMessage);
        }
    });
}
// global, all file type, content cleansing
function cleanseText(options, cb) {
    return function (error, text) {
        if (!error) {
            // clean up text
            text = (0, util_1.replaceBadCharacters)(text);
            if (options.preserveLineBreaks || options.preserveOnlyMultipleLineBreaks) {
                if (options.preserveOnlyMultipleLineBreaks) {
                    text = text.replace(STRIP_ONLY_SINGLE_LINEBREAKS, '$1 ').trim();
                }
                text = text.replace(WHITELIST_PRESERVE_LINEBREAKS, ' ');
            }
            else {
                text = text.replace(WHITELIST_STRIP_LINEBREAKS, ' ');
            }
            // multiple spaces, tabs, vertical tabs, non-breaking space]
            text = text.replace(/ (?! )/g, '').replace(/[ \t\v\u00A0]{2,}/g, ' ');
            text = (0, html_entities_1.decode)(text);
        }
        cb(error, text);
    };
}
function initializeExtractors(options) {
    hasInitialized = true;
    // discover available extractors
    var extractors = fs_1.default.readdirSync(extractorPath).map(function (item) {
        var fullExtractorPath = path_1.default.join(extractorPath, item);
        // get the extractor
        // eslint-disable-next-line global-require,import/no-dynamic-require
        return require(fullExtractorPath);
    });
    // perform any binary tests to ensure extractor is possible
    // given execution environment
    extractors.forEach(function (extractor) {
        if (extractor.test) {
            testExtractor(extractor, options);
        }
        else {
            satisfiedExtractors++;
            registerExtractor(extractor);
        }
    });
    // need to keep track of how many extractors we have in total
    totalExtractors = extractors.length;
}
function findExtractor(type) {
    var iLen = regexExtractors.length;
    var extractor, regexExtractor;
    type = type.toLowerCase();
    if (typeExtractors[type]) {
        extractor = typeExtractors[type];
    }
    else {
        for (var i = 0; i < iLen; i++) {
            regexExtractor = regexExtractors[i];
            if (type.match(regexExtractor.reg)) {
                extractor = regexExtractor.extractor;
            }
        }
    }
    return extractor;
}
function extract(type, filePath, options, cb) {
    var error, msg, theExtractor;
    if (!hasInitialized) {
        initializeExtractors(options);
    }
    // registration of extractors complete?
    if (totalExtractors === satisfiedExtractors) {
        theExtractor = findExtractor(type);
        if (theExtractor) {
            cb = cleanseText(options, cb);
            theExtractor(filePath, options, cb);
        }
        else {
            // cannot extract this file type
            msg = "Error for type: [[ ".concat(type, " ]], file: [[ ").concat(filePath, " ]]");
            // update error message if type is supported but just not configured/installed properly
            if (failedExtractorTypes[type]) {
                msg += "".concat(', extractor for type exists, but failed to initialize. Message:').concat(failedExtractorTypes[type]);
            }
            error = new Error(msg);
            cb(error, null);
        }
    }
    else {
        // async registration has not wrapped up
        // try again later
        setTimeout(function () {
            extract(type, filePath, options, cb);
        }, 100);
    }
}
exports.extract = extract;
