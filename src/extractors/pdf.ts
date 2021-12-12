import path from 'path';
import { exec } from 'child_process';
import { extract as extractPdf } from '../pdf-text-extract';
import { CallbackType } from '../util';

export function extract(filePath: string, options: { pdftotextOptions: { layout: string } }, cb: CallbackType) {
  // See https://github.com/dbashford/textract/issues/75 for description of
  // what is happening here
  const pdftotextOptions = options.pdftotextOptions || { layout: 'raw' };

  extractPdf(filePath, pdftotextOptions, (error: Error, pages: any[]) => {
    if (error) {
      error = new Error(
        `Error extracting PDF text for file at [[ ${path.basename(filePath)} ]], error: ${error?.message}`
      );
      cb(error, null);
      return;
    }
    const fullText = pages.join(' ').trim();
    cb(null, fullText);
  });
}

export function test(options: any, cb: CallbackType) {
  exec('pdftotext -v', (error, stdout, stderr) => {
    let msg;
    if (stderr && stderr.indexOf('pdftotext version') > -1) {
      cb(true);
    } else {
      msg = "INFO: 'pdftotext' does not appear to be installed, so textract will be unable to extract PDFs.";
      cb(false, msg);
    }
  });
}

export const types = ['application/pdf'];
