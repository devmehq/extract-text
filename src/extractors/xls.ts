import path from 'path';
import xlsx from 'xlsx';
import { CallbackType } from '../util';

export function extract(filePath: string, options: any, cb: CallbackType) {
  let CSVs: any, wb, result: string, error;

  try {
    wb = xlsx.readFile(filePath);
    const firstKey = Object.keys(wb.Sheets)[0];
    CSVs = xlsx.utils.sheet_to_csv(wb.Sheets[firstKey]);
    // handle error in file type
    if (CSVs === 'this is not a xlsx file\n') {
      throw new Error('this is not a xlsx file');
    }
  } catch (err) {
    error = new Error(`Could not extract ${path.basename(filePath)}, ${err}`);
    cb(error, null);
    return;
  }

  result = '';
  Object.keys(CSVs).forEach((key) => {
    result += CSVs[key];
  });

  cb(null, result);
}

export const types = [
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel.sheet.binary.macroEnabled.12',
  'application/vnd.ms-excel.sheet.macroEnabled.12',
  'application/vnd.oasis.opendocument.spreadsheet',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.template',
  'application/vnd.oasis.opendocument.spreadsheet-template',
];
