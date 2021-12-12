"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.types = exports.extract = void 0;
var fs_1 = __importDefault(require("fs"));
var iconv_lite_1 = __importDefault(require("iconv-lite"));
var jschardet_1 = __importDefault(require("jschardet"));
var path_1 = __importDefault(require("path"));
function extract(filePath, options, cb) {
    fs_1.default.readFile(filePath, function (error, data) {
        var encoding, decoded, detectedEncoding;
        if (error) {
            cb(error, null);
            return;
        }
        try {
            detectedEncoding = jschardet_1.default.detect(data).encoding;
            if (!detectedEncoding) {
                error = new Error("Could not detect encoding for file named [[ ".concat(path_1.default.basename(filePath), " ]]"));
                cb(error, null);
                return;
            }
            encoding = detectedEncoding.toLowerCase();
            decoded = iconv_lite_1.default.decode(data, encoding);
        }
        catch (e) {
            cb(e);
            return;
        }
        cb(null, decoded);
    });
}
exports.extract = extract;
exports.types = [/text\//, 'application/csv', 'application/javascript'];
