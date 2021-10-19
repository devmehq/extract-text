const fs = require('fs'),
  path = require('path'),
  mime = require('mime'),
  os = require('os'),
  got = require('got'),
  extract = require('./extract'),
  tmpDir = os.tmpdir();

function _genRandom() {
  return Math.floor(Math.random() * 100000000000 + 1);
}

function _extractWithType(type, filePath, options, cb) {
  if (fs.existsSync(filePath)) {
    extract(type, filePath, options, cb);
  } else {
    cb(new Error(`File at path [[ ${filePath} ]] does not exist.`), null);
  }
}

function _returnArgsError(_args) {
  const args = Array.prototype.slice.call(_args);
  let callback;

  args.forEach((parm) => {
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

function _writeBufferToDisk(buff, cb) {
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

function fromFileWithMimeAndPath(type, filePath, options, cb) {
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

function fromFileWithPath(filePath, options, cb) {
  if (typeof filePath === 'string' && (typeof options === 'function' || typeof cb === 'function')) {
    const type = (options && options.typeOverride) || mime.getType(filePath);
    fromFileWithMimeAndPath(type, filePath, options, cb);
  } else {
    // eslint-disable-next-line prefer-rest-params
    _returnArgsError(arguments);
  }
}

// eslint-disable-next-line no-unused-vars
function fromBufferWithMime(type, bufferContent, options, cb, withPath) {
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

function fromBufferWithName(filePath, bufferContent, options, cb) {
  let type;
  if (typeof filePath === 'string') {
    type = mime.getType(filePath);
    fromBufferWithMime(type, bufferContent, options, cb, true);
  } else {
    // eslint-disable-next-line prefer-rest-params
    _returnArgsError(arguments);
  }
}

function fromUrl(url, options, cb) {
  let extname, filePath, fullFilePath, file, callbackCalled;

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

    got
      .stream(url)
      .on('response', (response) => {
        // allows for overriding by the developer or automatically
        // populating based on server response.
        if (!options.typeOverride) {
          options.typeOverride = response.headers['content-type'].split(/;/)[0];
        }
      })
      .on('error', (error) => {
        const _cb = typeof options === 'function' ? options : cb;
        callbackCalled = true;
        _cb(error);
      })
      .pipe(file);
  } else {
    // eslint-disable-next-line prefer-rest-params
    _returnArgsError(arguments);
  }
}

module.exports = {
  fromFileWithPath: fromFileWithPath,
  fromFileWithMimeAndPath: fromFileWithMimeAndPath,
  fromBufferWithName: fromBufferWithName,
  fromBufferWithMime: fromBufferWithMime,
  fromUrl: fromUrl,
};
