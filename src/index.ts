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

export function fromFileWithMimeAndPath(
  type: string,
  filePath: boolean | Error | fs.PathLike,
  options: any,
  cb: CallbackType
) {
  let called = false;

  if (typeof type === 'string' && typeof filePath === 'string') {
    if (typeof cb === 'function' && typeof options === 'object') {
      // (mimeType, filePath, options, callback)
      _extractWithType(type, filePath, options, cb);
      called = true;
    } else if (typeof options === 'function' && cb === undefined) {
      // (mimeType, filePath, callback)
      _extractWithType(type, filePath, {}, options);
      called = true;
    }
  }

  if (!called) {
    // eslint-disable-next-line prefer-rest-params
    _returnArgsError(arguments);
  }
}

export function fromFileWithPath(
  filePath: boolean | Error | fs.PathLike,
  options: {
    preserveLineBreaks?: string | boolean;
    includeAltText?: boolean;
    typeOverride?: any;
  },
  cb: CallbackType
) {
  if (typeof filePath === 'string' && (typeof options === 'function' || typeof cb === 'function')) {
    const type = (options && options.typeOverride) || mime.getType(filePath);
    fromFileWithMimeAndPath(type, filePath, options, cb);
  } else {
    // eslint-disable-next-line prefer-rest-params
    _returnArgsError(arguments);
  }
}

// eslint-disable-next-line no-unused-vars
export function fromBufferWithMime(
  type: string,
  bufferContent: Buffer,
  options: CallbackType,
  cb: CallbackType,
  withPath: boolean
) {
  if (
    typeof type === 'string' &&
    bufferContent &&
    bufferContent instanceof Buffer &&
    (typeof options === 'function' || typeof cb === 'function')
  ) {
    _writeBufferToDisk(bufferContent, (newPath) => {
      fromFileWithMimeAndPath(type, newPath, options, cb);
    });
  } else {
    // eslint-disable-next-line prefer-rest-params
    _returnArgsError(arguments);
  }
}

export function fromBufferWithName(filePath: string, bufferContent: Buffer, options: CallbackType, cb: CallbackType) {
  let type;
  if (typeof filePath === 'string') {
    type = mime.getType(filePath);
    fromBufferWithMime(type, bufferContent, options, cb, true);
  } else {
    // eslint-disable-next-line prefer-rest-params
    _returnArgsError(arguments);
  }
}

export function fromUrl(
  url: string | any,
  options: {
    preserveLineBreaks?: string | boolean;
    typeOverride?: any;
  },
  cb: CallbackType
) {
  let extname, filePath, fullFilePath: boolean | fs.PathLike | Error, file: fs.WriteStream, callbackCalled: boolean;

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
