import { exec, ExecOptions } from 'child_process';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { ZipFile } from 'yauzl';

const outDir = path.join(os.tmpdir(), 'textract');
const replacements: [RegExp, string][] = [
  [/[\u201C|\u201D|]|â€œ|â€/g, '"'], // fancy double quotes
  [/[\u2018|\u2019]|â€™|â€˜]/g, "'"], // fancy single quotes/apostrophes
  [/â€¦/g, '…'], // elipses
  [/â€“|â€”/g, '–'], // long hyphen
];
const rLen = replacements.length;
// Up front creation of tmp dir
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir);
}

// replace nasty quotes with simple ones
export function replaceBadCharacters(text: string) {
  let i, repl;
  for (i = 0; i < rLen; i++) {
    repl = replacements[i];
    text = text.replace(repl[0], repl[1]);
  }
  return text;
}

export type CallbackType = (error: Error | boolean | string, result?: any) => any;

export function yauzlError(err: Error, cb?: CallbackType) {
  let msg: string = err.message;
  if (msg === 'end of central directory record signature not found') {
    msg = `File not correctly recognized as zip file, ${msg}`;
  }
  cb(new Error(msg), null);
}

export function createExecOptions(type: any, options: any) {
  let execOptions: any = {};
  if (options[type] && options[type].exec) {
    execOptions = options[type].exec;
  } else if (options.exec) {
    execOptions = options.exec;
  }
  return execOptions;
}

export function unzipCheck(type: any, cb: CallbackType) {
  exec('unzip', (error /* , stdout, stderr */) => {
    if (error) {
      // eslint-disable-next-line no-console
      console.error(
        `textract: 'unzip' does not appear to be installed, so textract will be unable to extract ${type}.`
      );
    }
    cb(error === null);
  });
}

export function getTextFromZipFile(zipfile: ZipFile, entry: any, cb: CallbackType) {
  zipfile.openReadStream(entry, (err, readStream) => {
    let text = '';
    let error = '';
    if (err) {
      cb(err, null);
      return;
    }

    readStream.on('data', (chunk) => {
      text += chunk;
    });
    readStream.on('end', () => {
      if (error.length > 0) {
        cb(error, null);
      } else {
        cb(null, text);
      }
    });
    readStream.on('error', (_err) => {
      error += _err;
    });
  });
}

/**
 * 1) builds an exec command using provided `genCommand` callback
 * 2) runs that command against an input file path
 *   resulting in an output file
 * 3) reads that output file in
 * 4) cleans the output file up
 * 5) executes a callback with the contents of the file
 *
 * @param {string} label Name for the extractor, e.g. `Tesseract`
 * @param {string} filePath path to file to be extractor
 * @param {object} options extractor options as provided
 *   via user configuration
 * @param {object} execOptions execution options passed to
 *   `exec` commmand as provided via user configuration
 * @param {function} genCommand function used to generate
 *   the command to be executed
 * @param {string} cb callback that is passed error/text
 *
 */
export function runExecIntoFile(
  label: any,
  filePath: string,
  options: any,
  execOptions: { encoding: 'buffer' } & ExecOptions,
  genCommand: (arg0: any, arg1: any, arg2: string) => any,
  cb: CallbackType
) {
  // escape the file paths
  const fileTempOutPath = path.join(outDir, path.basename(filePath, path.extname(filePath)));
  const escapedFilePath = filePath.replace(/\s/g, '\\ ');
  const escapedFileTempOutPath = fileTempOutPath.replace(/\s/g, '\\ ');
  const cmd = genCommand(options, escapedFilePath, escapedFileTempOutPath);
  exec(cmd, execOptions, (error /* , stdout, stderr */) => {
    if (error !== null) {
      error = new Error(`Error extracting [[ ${path.basename(filePath)} ]], exec error: ${error.message}`);
      cb(error, null);
      return;
    }

    fs.exists(`${fileTempOutPath}.txt`, (exists) => {
      if (exists) {
        fs.readFile(`${fileTempOutPath}.txt`, 'utf8', (error2, text) => {
          if (error2) {
            error2 = new Error(`Error reading${label} output at [[ ${fileTempOutPath} ]], error: ${error2.message}`);
            cb(error2, null);
          } else {
            fs.unlink(`${fileTempOutPath}.txt`, (error3) => {
              if (error3) {
                error3 = new Error(
                  `Error, ${label} , cleaning up temp file [[ ${fileTempOutPath} ]], error: ${error3.message}`
                );
                cb(error3, null);
              } else {
                cb(null, text.toString());
              }
            });
          }
        });
      } else {
        error = new Error(`Error reading ${label} output at [[ ${fileTempOutPath} ]], file does not exist`);
        cb(error, null);
      }
    });
  });
}
