"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var path_1 = __importDefault(require("path"));
var index_1 = require("./index");
module.exports = function (filePath, flags) {
    filePath = path_1.default.resolve(process.cwd(), filePath);
    flags.preserveLineBreaks = flags.preserveLineBreaks !== 'false';
    (0, index_1.fromFileWithPath)(filePath, flags, function (error, text) {
        if (error) {
            // eslint-disable-next-line no-console
            console.error(error);
        }
        else {
            // eslint-disable-next-line no-console
            console.log(text);
        }
    });
};
