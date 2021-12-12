"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fromUrl = exports.fromBufferWithName = exports.fromBufferWithMime = exports.fromFileWithPath = exports.fromFileWithMimeAndPath = void 0;
var axios_1 = __importDefault(require("axios"));
var fs_1 = __importDefault(require("fs"));
var path_1 = __importDefault(require("path"));
var mime_1 = __importDefault(require("mime"));
var os_1 = __importDefault(require("os"));
var extract_1 = require("./extract");
var tmpDir = os_1.default.tmpdir();
function _genRandom() {
    return Math.floor(Math.random() * 100000000000 + 1);
}
function _extractWithType(type, filePath, options, cb) {
    if (fs_1.default.existsSync(filePath)) {
        (0, extract_1.extract)(type, filePath, options, cb);
    }
    else {
        cb(new Error("File at path [[ ".concat(filePath, " ]] does not exist.")), null);
    }
}
function _returnArgsError(_args) {
    var args = Array.prototype.slice.call(_args);
    var callback;
    args.forEach(function (parm) {
        if (parm && typeof parm === 'function') {
            callback = parm;
        }
    });
    if (callback) {
        callback(new Error('Incorrect parameters passed to textract.'), null);
    }
    else {
        // eslint-disable-next-line no-console
        console.error('textract could not find a callback function to execute.');
    }
}
function _writeBufferToDisk(buff, cb) {
    var fullPath = path_1.default.join(tmpDir, "textract_file_".concat(_genRandom()));
    fs_1.default.open(fullPath, 'w', function (err, fd) {
        if (err) {
            throw new Error("error opening temp file: ".concat(err));
        }
        else {
            fs_1.default.write(fd, buff, 0, buff.length, null, function (err2) {
                if (err2) {
                    throw new Error("error writing temp file: ".concat(err2));
                }
                else {
                    fs_1.default.close(fd, function () {
                        cb(fullPath);
                    });
                }
            });
        }
    });
}
function fromFileWithMimeAndPath(type, filePath, options, cb) {
    var called = false;
    if (typeof type === 'string' && typeof filePath === 'string') {
        if (typeof cb === 'function' && typeof options === 'object') {
            // (mimeType, filePath, options, callback)
            _extractWithType(type, filePath, options, cb);
            called = true;
        }
        else if (typeof options === 'function' && cb === undefined) {
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
exports.fromFileWithMimeAndPath = fromFileWithMimeAndPath;
function fromFileWithPath(filePath, options, cb) {
    if (typeof filePath === 'string' && (typeof options === 'function' || typeof cb === 'function')) {
        var type = (options && options.typeOverride) || mime_1.default.getType(filePath);
        fromFileWithMimeAndPath(type, filePath, options, cb);
    }
    else {
        // eslint-disable-next-line prefer-rest-params
        _returnArgsError(arguments);
    }
}
exports.fromFileWithPath = fromFileWithPath;
// eslint-disable-next-line no-unused-vars
function fromBufferWithMime(type, bufferContent, options, cb, withPath) {
    if (typeof type === 'string' &&
        bufferContent &&
        bufferContent instanceof Buffer &&
        (typeof options === 'function' || typeof cb === 'function')) {
        _writeBufferToDisk(bufferContent, function (newPath) {
            fromFileWithMimeAndPath(type, newPath, options, cb);
        });
    }
    else {
        // eslint-disable-next-line prefer-rest-params
        _returnArgsError(arguments);
    }
}
exports.fromBufferWithMime = fromBufferWithMime;
function fromBufferWithName(filePath, bufferContent, options, cb) {
    var type;
    if (typeof filePath === 'string') {
        type = mime_1.default.getType(filePath);
        fromBufferWithMime(type, bufferContent, options, cb, true);
    }
    else {
        // eslint-disable-next-line prefer-rest-params
        _returnArgsError(arguments);
    }
}
exports.fromBufferWithName = fromBufferWithName;
function fromUrl(url, options, cb) {
    var extname, filePath, fullFilePath, file, callbackCalled;
    // allow url to be either a string or to be a
    // Node URL Object: https://nodejs.org/api/url.html
    var href = typeof url === 'string' ? url : url.href;
    if (href) {
        var urlNoQueryParams = href.split('?')[0];
        options = options || {};
        extname = path_1.default.extname(urlNoQueryParams);
        filePath = _genRandom() + extname;
        fullFilePath = path_1.default.join(tmpDir, filePath);
        file = fs_1.default.createWriteStream(fullFilePath);
        file.on('finish', function () {
            if (!callbackCalled) {
                fromFileWithPath(fullFilePath, options, cb);
            }
        });
        axios_1.default
            .get(url, { responseType: 'stream' })
            .then(function (response) {
            response.data.pipe(file);
        })
            .catch(function (error) {
            var _cb = typeof options === 'function' ? options : cb;
            callbackCalled = true;
            _cb(error);
        });
    }
    else {
        // eslint-disable-next-line prefer-rest-params
        _returnArgsError(arguments);
    }
}
exports.fromUrl = fromUrl;
