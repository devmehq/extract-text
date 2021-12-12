import { exec } from 'child_process';
import path from 'path';
import { CallbackType, createExecOptions } from '../util';

export function extract(filePath: string, options: any, cb: CallbackType) {
  const execOptions = createExecOptions('dxf', options),
    escapedPath = filePath.replace(/\s/g, '\\ ');
  exec(`drawingtotext ${escapedPath}`, execOptions, (error, stdout, stderr) => {
    if (stderr.toString() !== '') {
      error = new Error(`error extracting DXF text ${path.basename(filePath)}: ${stderr}`);
      cb(error, null);
      return;
    }

    cb(null, stdout);
  });
}

export function test(options: any, cb: CallbackType) {
  exec('drawingtotext notalegalfile', (error, stdout, stderr) => {
    const errorRegex = /I couldn't make sense of your input/;
    if (!(stderr && errorRegex.test(stderr))) {
      const msg = "INFO: 'drawingtotext' does not appear to be installed, so textract will be unable to extract DXFs.";
      cb(false, msg);
    } else {
      cb(true);
    }
  });
}

export const types = [
  'application/dxf',
  'application/x-autocad',
  'application/x-dxf',
  'drawing/x-dxf',
  'image/vnd.dxf',
  'image/x-autocad',
  'image/x-dxf',
  'zz-application/zz-winassoc-dxf',
];
