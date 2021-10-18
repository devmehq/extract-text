const { spawn } = require('child_process'),
  { exec } = require('child_process'),
  os = require('os'),
  path = require('path');

let types;

// textutil -convert txt -stdout foo.doc
function extractText(filePath, options, cb) {
  let result = '',
    error = null;
  const textutil = spawn('textutil', ['-convert', 'txt', '-stdout', filePath]);
  textutil.stdout.on('data', (buffer) => {
    result += buffer.toString();
  });

  textutil.stderr.on('error', (buffer) => {
    if (!error) {
      error = '';
    }
    error += buffer.toString();
  });

  textutil.on('close', (/* code */) => {
    if (error || result === 'not a doc') {
      error = new Error(`textutil read of file named [[ ${path.basename(filePath)} ]] failed: ${error}`);
      cb(error, null);
      return;
    }
    cb(null, result.trim());
  });
}

function testForBinary(options, cb) {
  // just osx extractor, so don't bother checking on osx
  if (os.platform() !== 'darwin') {
    cb(true);
    return;
  }

  exec(`textutil ${__filename}`, (error /* , stdout, stderr */) => {
    let msg;
    if (error !== null) {
      msg = "INFO: 'textutil' does not appear to be installed,so textract will be unable to extract DOCs.";
    }
    cb(error === null, msg);
  });
}

if (os.platform() === 'darwin') {
  types = ['application/msword', 'application/rtf', 'text/rtf'];
  // types = [];
} else {
  types = [];
}

module.exports = {
  types: types,
  extract: extractText,
  test: testForBinary,
};
