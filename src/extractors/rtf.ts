import { exec } from 'child_process';
import os from 'os';
import path from 'path';
import { CallbackType, createExecOptions } from '../util';
import { extractFromText } from './html';

export function extract(filePath: string, options: any, cb: CallbackType) {
  const execOptions = createExecOptions('rtf', options),
    escapedPath = filePath.replace(/\s/g, '\\ ');
  // Going to output html from unrtf because unrtf does a great job of
  // going to html, but does a crap job of going to text. It leaves sections
  // out, strips apostrophes, leaves nasty quotes in for bullets and more
  // that I've likely not yet discovered.
  //
  // textract can go from html to text on its own, so let unrtf go to html
  // then extract the text from that
  //
  // Also do not have to worry about stripping comments from unrtf text
  // output since HTML comments are not included in output. Also, the
  // unrtf --quiet option doesn't work.
  exec(`unrtf --html --nopict ${escapedPath}`, execOptions, (error, stdout /* , stderr */) => {
    let err;
    if (error) {
      err = new Error(`unrtf read of file named [[ ${path.basename(filePath)} ]] failed: ${error}`);
      cb(err, null);
    } else {
      extractFromText(stdout.toString().trim(), {}, cb);
    }
  });
}

export function test(options: any, cb: CallbackType) {
  // just non-osx extractor
  if (os.platform() === 'darwin') {
    cb(true);
    return;
  }

  exec(`unrtf ${__filename}`, (error /* , stdout, stderr */) => {
    let msg;
    if (error !== null && error.message && error.message.indexOf('not found') !== -1) {
      msg = "INFO: 'unrtf' does not appear to be installed, so textract will be unable to extract RTFs.";
      cb(false, msg);
    } else {
      cb(true);
    }
  });
}

let types: string[] = [];
// rely on native tools on osx
if (os.platform() === 'darwin') {
  // types = ['application/rtf', 'text/rtf'];
} else {
  types = ['application/rtf', 'text/rtf'];
}

export { types };
