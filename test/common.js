global.expect = require('chai').expect;

const textract = require('../lib');

global.textract = textract;
global.fromBufferWithName = textract.fromBufferWithName;
global.fromBufferWithMime = textract.fromBufferWithMime;
global.fromFileWithPath = textract.fromFileWithPath;
global.fromFileWithMimeAndPath = textract.fromFileWithMimeAndPath;
global.fromUrl = textract.fromUrl;
