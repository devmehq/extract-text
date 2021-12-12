"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.types = exports.extract = void 0;
var fs_1 = __importDefault(require("fs"));
var marked_1 = require("marked");
var html_1 = require("./html");
function extract(filePath, options, cb) {
    fs_1.default.readFile(filePath, function (error, data) {
        if (error) {
            cb(error, null);
            return;
        }
        (0, marked_1.marked)(data.toString(), function (err, content) {
            if (err) {
                cb(err, null);
            }
            else {
                (0, html_1.extractFromText)(content, options, cb);
            }
        });
    });
}
exports.extract = extract;
exports.types = ['text/x-markdown', 'text/markdown'];
