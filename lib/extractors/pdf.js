const path = require('path'),
  { exec } = require('child_process'),
  extract = require('../pdf-text-extract');

function extractText(filePath, options, cb) {
  // See https://github.com/dbashford/textract/issues/75 for description of
  // what is happening here
  const pdftotextOptions = options.pdftotextOptions || { layout: 'raw' };

  extract(filePath, pdftotextOptions, (error, pages) => {
    if (error) {
      error = new Error(
        `Error extracting PDF text for file at [[ ${path.basename(filePath)} ]], error: ${error.message}`
      );
      cb(error, null);
      return;
    }
    const fullText = pages.join(' ').trim();
    cb(null, fullText);
  });
}

function testForBinary(options, cb) {
  exec('pdftotext -v', (error, stdout, stderr) => {
    let msg;
    if (stderr && stderr.indexOf('pdftotext version') > -1) {
      cb(true);
    } else {
      msg = "INFO: 'pdftotext' does not appear to be installed, " + 'so textract will be unable to extract PDFs.';
      cb(false, msg);
    }
  });
}

module.exports = {
  types: ['application/pdf'],
  extract: extractText,
  test: testForBinary,
};
