import axios from 'axios';
import fs from 'fs';
import path from 'path';
import mime from 'mime';
import os from 'os';
import { extract } from './extract';
import { CallbackType } from './util';

const tmpDir = os.tmpdir();

function _genRandom() {
  return Math.floor(Math.random() * 100000000000 + 1);
}

function _extractWithType(type: string, filePath: fs.PathLike, options: any, cb: CallbackType) {
  if (fs.existsSync(filePath)) {
    extract(type, filePath, options, cb);
  } else {
    cb(new Error(`File at path [[ ${filePath} ]] does not exist.`), null);
  }
}

function _returnArgsError(_args: IArguments) {
  const args = Array.prototype.slice.call(_args);
  let callback: CallbackType;

  args.forEach((parm: any) => {
    if (parm && typeof parm === 'function') {
      callback = parm;
    }
  });

  if (callback) {
    callback(new Error('Incorrect parameters passed to textract.'), null);
  } else {
    // eslint-disable-next-line no-console
    console.error('textract could not find a callback function to execute.');
  }
}

function _writeBufferToDisk(buff: Buffer, cb: CallbackType) {
  const fullPath = path.join(tmpDir, `textract_file_${_genRandom()}`);

  fs.open(fullPath, 'w', (err, fd) => {
    if (err) {
      throw new Error(`error opening temp file: ${err}`);
    } else {
      fs.write(fd, buff, 0, buff.length, null, (err2) => {
        if (err2) {
          throw new Error(`error writing temp file: ${err2}`);
        } else {
          fs.close(fd, () => {
            cb(fullPath);
          });
        }
      });
    }
  });
}

export function fromFileWithMimeAndPath(type: string, filePath: string, options: any, cb: CallbackType) {
  _extractWithType(type, filePath, options, cb);
}

export function fromFileWithPath(
  filePath: string,
  options: {
    preserveOnlyMultipleLineBreaks?: boolean;
    preserveLineBreaks?: string | boolean;
    includeAltText?: boolean;
    typeOverride?: any;
    tesseract?: { lang?: string; cmd?: string };
    pdftotextOptions?: { userPassword?: string };
  },
  cb: CallbackType
) {
  const type = (options && options.typeOverride) || mime.getType(filePath);
  fromFileWithMimeAndPath(type, filePath, options, cb);
}

// eslint-disable-next-line no-unused-vars
export function fromBufferWithMime(
  type: string,
  bufferContent: Buffer,
  options: Record<string, any>,
  cb: CallbackType,
  withPath?: boolean
) {
  if (
    typeof type === 'string' &&
    bufferContent &&
    bufferContent instanceof Buffer &&
    (typeof options === 'function' || typeof cb === 'function')
  ) {
    _writeBufferToDisk(bufferContent, (newPath: string) => {
      fromFileWithMimeAndPath(type, newPath, options, cb);
    });
  } else {
    // eslint-disable-next-line prefer-rest-params
    _returnArgsError(arguments);
  }
}

export function fromBufferWithName(
  filePath: string,
  bufferContent: Buffer,
  options: Record<string, any>,
  cb: CallbackType
) {
  let type;
  if (typeof filePath === 'string') {
    mime.getType(filePath);
  }
  fromBufferWithMime(type, bufferContent, options, cb, true);
}

export function fromUrl(
  url: string | any,
  options: {
    preserveLineBreaks?: string | boolean;
    typeOverride?: any;
  },
  cb: CallbackType
) {
  let extname, filePath, fullFilePath: string, file: fs.WriteStream, callbackCalled: boolean;

  // allow url to be either a string or to be a
  // Node URL Object: https://nodejs.org/api/url.html
  const href = typeof url === 'string' ? url : url.href;

  if (href) {
    const urlNoQueryParams = href.split('?')[0];
    options = options || {};
    extname = path.extname(urlNoQueryParams);
    filePath = _genRandom() + extname;
    fullFilePath = path.join(tmpDir, filePath);
    file = fs.createWriteStream(fullFilePath);
    file.on('finish', () => {
      if (!callbackCalled) {
        fromFileWithPath(fullFilePath, options, cb);
      }
    });

    axios
      .get(url, { responseType: 'stream' })
      .then((response) => {
        response.data.pipe(file);
      })
      .catch((error) => {
        const _cb = typeof options === 'function' ? options : cb;
        callbackCalled = true;
        _cb(error);
      });
  } else {
    // eslint-disable-next-line prefer-rest-params
    _returnArgsError(arguments);
  }
}
