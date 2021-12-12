import { fromBufferWithMime, fromBufferWithName, fromFileWithMimeAndPath, fromFileWithPath, fromUrl } from '../src';

global.expect = require('chai').expect;

import { extract } from '../src/extract';

global.textract = extract;
global.fromBufferWithName = fromBufferWithName;
global.fromBufferWithMime = fromBufferWithMime;
global.fromFileWithPath = fromFileWithPath;
global.fromFileWithMimeAndPath = fromFileWithMimeAndPath;
global.fromUrl = fromUrl;
