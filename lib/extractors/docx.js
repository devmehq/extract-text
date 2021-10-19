const xpath = require('xpath'),
  Dom = require('xmldom').DOMParser,
  yauzl = require('yauzl'),
  util = require('../util'),
  includeRegex = /.xml$/,
  excludeRegex = /^(word\/media\/|word\/_rels\/)/;

function _calculateExtractedText(inText, preserveLineBreaks) {
  const doc = new Dom().parseFromString(inText),
    ps = xpath.select("//*[local-name()='p']", doc);
  let text = '';
  ps.forEach((paragraph) => {
    let localText = '';
    paragraph = new Dom().parseFromString(paragraph.toString());
    const ts = xpath.select("//*[local-name()='t' or local-name()='tab' or local-name()='br']", paragraph);
    ts.forEach((t) => {
      if (t.localName === 't' && t.childNodes.length > 0) {
        localText += t.childNodes[0].data;
      } else if (t.localName === 'tab') {
        localText += ' ';
      } else if (t.localName === 'br') {
        if (preserveLineBreaks !== true) {
          localText += ' ';
        } else {
          localText += '\n';
        }
      }
    });
    text += `${localText}\n`;
  });

  return text;
}

function extractText(filePath, options, cb) {
  let result = '';

  yauzl.open(filePath, (err, zipfile) => {
    let processedEntries = 0;
    if (err) {
      util.yauzlError(err, cb);
      return;
    }

    const processEnd = () => {
      let text;
      processedEntries += 1;
      if (zipfile.entryCount === processedEntries) {
        if (result.length) {
          text = _calculateExtractedText(result, options.preserveLineBreaks);
          cb(null, text);
        } else {
          cb(
            new Error('Extraction could not find content in file, are you sure it is the mime type it says it is?'),
            null
          );
        }
      }
    };

    zipfile.on('entry', (entry) => {
      if (includeRegex.test(entry.fileName) && !excludeRegex.test(entry.fileName)) {
        util.getTextFromZipFile(zipfile, entry, (err2, text) => {
          result += `${text}\n`;
          processEnd();
        });
      } else {
        processEnd();
      }
    });

    zipfile.on('error', (err3) => {
      cb(err3);
    });
  });
}

module.exports = {
  types: ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  extract: extractText,
};
