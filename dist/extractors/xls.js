"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.types = exports.extract = void 0;
var path_1 = __importDefault(require("path"));
var xlsx_1 = __importDefault(require("xlsx"));
function extract(filePath, options, cb) {
    var CSVs, wb, result, error;
    try {
        wb = xlsx_1.default.readFile(filePath);
        var firstKey = Object.keys(wb.Sheets)[0];
        CSVs = xlsx_1.default.utils.sheet_to_csv(wb.Sheets[firstKey]);
        // handle error in file type
        if (CSVs === 'this is not a xlsx file\n') {
            throw new Error('this is not a xlsx file');
        }
    }
    catch (err) {
        error = new Error("Could not extract ".concat(path_1.default.basename(filePath), ", ").concat(err));
        cb(error, null);
        return;
    }
    result = '';
    Object.keys(CSVs).forEach(function (key) {
        result += CSVs[key];
    });
    cb(null, result);
}
exports.extract = extract;
exports.types = [
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel.sheet.binary.macroEnabled.12',
    'application/vnd.ms-excel.sheet.macroEnabled.12',
    'application/vnd.oasis.opendocument.spreadsheet',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.template',
    'application/vnd.oasis.opendocument.spreadsheet-template',
];
