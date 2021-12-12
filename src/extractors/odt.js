const cheerio = require('cheerio'),
  yauzl = require('yauzl'),
  util = require('../util');

function extractText(filePath, options, cb) {
  yauzl.open(filePath, (err, zipfile) => {
    let textOnTheWay = false;

    if (err) {
      util.yauzlError(err, cb);
      return;
    }

    zipfile.on('end', () => {
      if (!textOnTheWay) {
        cb(
          new Error('Extraction could not find content.xml in file, are you sure it is the mime type it says it is?'),
          null
        );
      }
    });

    zipfile.on('entry', (entry) => {
      if (entry.fileName === 'content.xml') {
        textOnTheWay = true;
        util.getTextFromZipFile(zipfile, entry, (err2, text) => {
          const output = text
              .replace('inflating: content.xml', '')
              .replace(/^(.Archive).*/, '')
              .replace(/text:p/g, 'textractTextNode')
              .replace(/text:h/g, 'textractTextNode')
              // remove empty nodes
              .replace(/<textractTextNode\/>/g, '')
              // remove empty nodes that have styles
              .replace(/<textractTextNode[^>]*\/>/g, '')
              .trim(),
            $ = cheerio.load(`<body>${output}</body>`),
            nodes = $('textractTextNode'),
            nodeTexts = [];

          for (let i = 0; i < nodes.length; i++) {
            nodeTexts.push($(nodes[i]).text());
          }

          cb(null, nodeTexts.join('\n'));
        });
      }
    });

    zipfile.on('error', (err3) => {
      cb(err3);
    });
  });
}

module.exports = {
  types: [
    'application/vnd.oasis.opendocument.text',
    'application/vnd.oasis.opendocument.text-template',
    'application/vnd.oasis.opendocument.graphics',
    'application/vnd.oasis.opendocument.graphics-template',
    'application/vnd.oasis.opendocument.presentation',
    'application/vnd.oasis.opendocument.presentation-template',
  ],
  extract: extractText,
};
