import fs from 'fs';
import iconv from 'iconv-lite';
import jschardet from 'jschardet';
import path from 'path';
import { CallbackType } from '../util';

export function extract(filePath: string, options: any, cb: CallbackType) {
  fs.readFile(filePath, (error, data) => {
    let encoding, decoded, detectedEncoding;
    if (error) {
      cb(error, null);
      return;
    }
    try {
      detectedEncoding = jschardet.detect(data).encoding;
      if (!detectedEncoding) {
        error = new Error(`Could not detect encoding for file named [[ ${path.basename(filePath)} ]]`);
        cb(error, null);
        return;
      }
      encoding = detectedEncoding.toLowerCase();

      decoded = iconv.decode(data, encoding);
    } catch (e) {
      cb(e);
      return;
    }
    cb(null, decoded);
  });
}

export const types = [/text\//, 'application/csv', 'application/javascript'];
