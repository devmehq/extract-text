const path = require('path'),
  xlsx = require('xlsx');

function extractText(filePath, options, cb) {
  let CSVs, wb, result, error;

  try {
    wb = xlsx.readFile(filePath);
    const firstKey = Object.keys(wb.Sheets)[0];
    CSVs = xlsx.utils.sheet_to_csv(wb.Sheets[firstKey]);
  } catch (err) {
    error = new Error(`Could not extract ${path.basename(filePath)}, ${err}`);
    cb(error, null);
    return;
  }
  // if (filePath.includes('.xltx')) {
  //   console.log({ filePath, wb, CSVs });
  //   process.exit(1);
  // }

  result = '';
  Object.keys(CSVs).forEach((key) => {
    result += CSVs[key];
  });

  cb(null, result);
}

module.exports = {
  types: [
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel.sheet.binary.macroEnabled.12',
    'application/vnd.ms-excel.sheet.macroEnabled.12',
    'application/vnd.oasis.opendocument.spreadsheet',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.template',
    'application/vnd.oasis.opendocument.spreadsheet-template',
  ],
  extract: extractText,
};
