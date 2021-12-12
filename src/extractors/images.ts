import { exec } from 'child_process';
import { CallbackType, createExecOptions, runExecIntoFile } from '../util';

function tesseractExtractionCommand(options: { tesseract: { lang: any; cmd: any } }, inputFile: any, outputFile: any) {
  let cmd = `tesseract ${inputFile} ${outputFile}`;
  if (options.tesseract) {
    if (options.tesseract.lang) {
      cmd += ` -l ${options.tesseract.lang}`;
    } else if (options.tesseract.cmd) {
      cmd += ` ${options.tesseract.cmd}`;
    }
  }
  cmd += ' quiet';
  return cmd;
}

export function extract(filePath: string, options: any, cb: CallbackType) {
  const execOptions = createExecOptions('images', options);
  runExecIntoFile('tesseract', filePath, options, execOptions, tesseractExtractionCommand, cb);
}

export function test(options: any, cb: CallbackType) {
  exec('tesseract', (error, stdout, stderr) => {
    let msg;
    // checking for content of help text
    if (
      (error && error.toString().indexOf('Usage:') > -1) ||
      (stderr && stderr.toString().indexOf('Usage:') > -1) ||
      (stdout && stdout.toString().indexOf('Usage:') > -1)
    ) {
      cb(true);
    } else {
      msg = "INFO: 'tesseract' does not appear to be installed, so textract will be unable to extract images.";
      cb(false, msg);
    }
  });
}

export const types = ['image/png', 'image/jpeg', 'image/gif'];
