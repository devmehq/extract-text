import xpath from 'xpath';
import { DOMParser as Dom } from 'xmldom';
import yauzl from 'yauzl';
import { CallbackType, getTextFromZipFile, yauzlError } from '../util';

const slideMatch = /^ppt\/slides\/slide/;
const noteMatch = /^ppt\/notesSlides\/notesSlide/;

function _compareSlides(a: { slide: number }, b?: { slide: number }) {
  if (a.slide < b.slide) {
    return -1;
  }
  if (a.slide > b.slide) {
    return 1;
  }
  return 0;
}

function _calculateExtractedText(slideText: string) {
  const doc = new Dom().parseFromString(slideText),
    ps = xpath.select("//*[local-name()='p']", doc);
  let text = '';
  ps.forEach((paragraph) => {
    let localText = '';
    paragraph = new Dom().parseFromString(paragraph.toString());
    const ts = xpath.select("//*[local-name()='t' or local-name()='tab' or local-name()='br']", paragraph);
    ts.forEach((t: any) => {
      if (t.localName === 't' && t.childNodes.length > 0) {
        localText += t.childNodes[0].data;
      } else if (t.localName === 'tab' || t.localName === 'br') {
        localText += '';
      }
    });
    text += `${localText}\n`;
  });

  return text;
}

export function extract(filePath: string, options: any, cb: CallbackType) {
  const slides: { slide: number; text: any }[] = [];

  yauzl.open(filePath, (err, zipfile) => {
    if (err) {
      yauzlError(err, cb);
      return;
    }

    zipfile.on('end', () => {
      let slidesText, text;
      if (slides.length) {
        slides.sort(_compareSlides);
        slidesText = slides.map((slide) => slide.text).join('\n');
        text = _calculateExtractedText(slidesText);
        cb(null, text);
      } else {
        cb(
          new Error('Extraction could not find slides in file, are you sure it is the mime type it says it is?'),
          null
        );
      }
    });

    zipfile.on('entry', (entry) => {
      if (slideMatch.test(entry.fileName) || noteMatch.test(entry.fileName)) {
        getTextFromZipFile(zipfile, entry, (err2, text) => {
          const slide = +entry.fileName.replace('ppt/slides/slide', '').replace('.xml', '');
          slides.push({ slide: slide, text: text });
        });
      }
    });

    zipfile.on('error', (err3) => {
      cb(err3);
    });
  });
}

export const types = [
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.openxmlformats-officedocument.presentationml.template',
];
