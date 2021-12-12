import { exec } from 'child_process';
import os from 'os';
import path from 'path';
import { CallbackType, createExecOptions } from '../util';

export function extract(filePath: string, options: any, cb: CallbackType) {
  const execOptions = createExecOptions('doc', options);

  exec(`antiword -m UTF-8.txt "${filePath}"`, execOptions, (error, stdout) => {
    let err;
    if (error) {
      if (error.toString().indexOf('is not a Word Document') > 0) {
        err = new Error(`file named [[ ${path.basename(filePath)} ]] does not appear to really be a .doc file`);
      } else {
        err = new Error(`antiword read of file named [[ ${path.basename(filePath)} ]] failed: ${error}`);
      }
      cb(err, null);
    } else {
      cb(
        null,
        stdout
          .toString()
          .trim()
          .replace(/\[pic\]/g, '')
      );
    }
  });
}

export function test(options: any, cb: CallbackType) {
  // just non-osx extractor
  if (os.platform() === 'darwin') {
    cb(true);
    return;
  }

  const execOptions = createExecOptions('doc', options);

  exec(`antiword -m UTF-8.txt ${__filename}`, execOptions, (error /* , stdout, stderr */) => {
    let msg;
    if (error !== null && error.message && error.message.indexOf('not found') !== -1) {
      msg = "INFO: 'antiword' does not appear to be installed, so textract will be unable to extract DOCs.";
      cb(false, msg);
    } else {
      cb(true);
    }
  });
}

let types: string[];

if (os.platform() === 'darwin') {
  // types = ['application/msword'];
} else {
  types = ['application/msword'];
}

export { types };
