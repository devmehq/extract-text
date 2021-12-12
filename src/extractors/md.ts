import fs from 'fs';
import { marked } from 'marked';
import { extractFromText } from './html';
import { CallbackType } from '../util';

export function extract(filePath: fs.PathOrFileDescriptor, options: { includeAltText: any }, cb: CallbackType) {
  fs.readFile(filePath, (error, data) => {
    if (error) {
      cb(error, null);
      return;
    }

    marked(data.toString(), (err: string | boolean | Error, content: string | Buffer) => {
      if (err) {
        cb(err, null);
      } else {
        extractFromText(content, options, cb);
      }
    });
  });
}

export const types = ['text/x-markdown', 'text/markdown'];
