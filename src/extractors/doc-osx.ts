import { exec, spawn } from 'child_process';
import os from 'os';
import path from 'path';
import { CallbackType } from '../util';

// textutil -convert txt -stdout foo.doc
export function extract(filePath: string, options: any, cb: CallbackType) {
  let result = '';
  let error: string | boolean | Error = null;
  const textutil = spawn('textutil', ['-convert', 'txt', '-stdout', filePath]);
  textutil.stdout.on('data', (buffer) => {
    result += buffer.toString();
  });

  textutil.stderr.on('error', (buffer) => {
    if (!error) {
      error = '';
    }
    error += buffer.toString();
  });

  textutil.on('close', (/* code */) => {
    if (result === 'not a doc') {
      cb(result, null);
      return;
    }
    if (error) {
      error = new Error(`textutil read of file named [[ ${path.basename(filePath)} ]] failed: ${error}`);
      cb(error, null);
      return;
    }
    cb(null, result.trim());
  });
}

export function test(options: any, cb: CallbackType) {
  // just osx extractor, so don't bother checking on osx
  if (os.platform() !== 'darwin') {
    cb(true);
    return;
  }

  exec(`textutil ${__filename}`, (error /* , stdout, stderr */) => {
    let msg;
    if (error !== null) {
      msg = "INFO: 'textutil' does not appear to be installed,so textract will be unable to extract DOCs.";
    }
    cb(error === null, msg);
  });
}

let types: string[] = [];

if (os.platform() === 'darwin') {
  types = ['application/msword', 'application/rtf', 'text/rtf'];
  // types = [];
}

export { types };
