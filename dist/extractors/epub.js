"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.types = exports.extract = void 0;
var epub2_1 = require("epub2");
var html_1 = require("./html");
function extract(filePath, options, cb) {
    var epub = new epub2_1.EPub(filePath);
    var allText = '', hasError = false, chapterCount = 0;
    epub.on('end', function () {
        // Iterate over each chapter...
        epub.flow.forEach(function (chapter) {
            // if already error, don't do anything
            if (!hasError) {
                // Get the chapter text
                epub.getChapterRaw(chapter.id, function (rawChapterError, text) {
                    if (rawChapterError) {
                        hasError = true;
                        cb(rawChapterError, null);
                    }
                    else {
                        // Extract the raw text from the chapter text (it's html)
                        (0, html_1.extractFromText)(text, options, function (htmlExtractError, outText) {
                            if (htmlExtractError) {
                                hasError = true;
                                cb(htmlExtractError, null);
                            }
                            else {
                                allText += outText;
                                chapterCount++;
                                if (chapterCount === epub.flow.length) {
                                    cb(null, allText);
                                }
                            }
                        });
                    }
                });
            }
        });
    });
    epub.parse();
}
exports.extract = extract;
exports.types = ['application/epub+zip'];
