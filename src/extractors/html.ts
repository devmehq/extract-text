/* eslint-disable max-len */
import cheerio, { Cheerio, CheerioAPI, Element } from 'cheerio';
import fs from 'fs';
import { CallbackType } from '../util';
import { DataNode } from 'domhandler/lib/node';

function getTextWithAlt($: CheerioAPI, $element: Cheerio<Element>): string {
  if (!$element) {
    return '';
  }

  if ($element.is('img')) {
    return ` ${$element.attr('alt')} `;
  }

  if ($element.is('input')) {
    return $element.attr('value');
  }

  return $element
    .contents()
    .map((i, domElement) => {
      let returnText;

      if (domElement.nodeType === 3) {
        returnText = (domElement as DataNode).data;
      } else if (domElement.nodeType === 1) {
        $element = $(domElement) as Cheerio<Element>;
        if ($element.is('img, input') || $element.find('img[alt], input[value]').length > 0) {
          returnText = getTextWithAlt($, $element);
        } else {
          returnText = $element.text();
        }
      }
      return returnText;
    })
    .get()
    .join('');
}

export function extractFromText(data: Buffer | string, options: { includeAltText?: any } = {}, cb: CallbackType) {
  let $, text;

  text = data
    .toString()
    .replace(
      /< *(br|p|div|section|aside|button|header|footer|li|article|blockquote|cite|code|h1|h2|h3|h4|h5|h6|legend|nav)((.*?)>)/g,
      '<$1$2|||||'
    )
    .replace(/< *\/(td|a|option) *>/g, ' </$1>') // spacing some things out so text doesn't get smashed together
    .replace(/< *(a|td|option)/g, ' <$1') // spacing out links
    .replace(/< *(br|hr) +\/>/g, '|||||<$1\\>')
    .replace(
      /<\/ +?(p|div|section|aside|button|header|footer|li|article|blockquote|cite|code|h1|h2|h3|h4|h5|h6|legend|nav)>/g,
      '|||||</$1>'
    );

  text = `<textractwrapper>${text}<textractwrapper>`;

  try {
    $ = cheerio.load(text);
    $('script').remove();
    $('style').remove();
    $('noscript').remove();

    const $docElement = $('textractwrapper');

    if (options?.includeAltText) {
      text = getTextWithAlt($, $docElement);
    } else {
      text = $docElement.text();
    }

    text = text
      .replace(/\|\|\|\|\|/g, '\n')
      .replace(/(\n\u00A0|\u00A0\n|\n | \n)+/g, '\n')
      .replace(/(\r\u00A0|\u00A0\r|\r | \r)+/g, '\n')
      .replace(/(\v\u00A0|\u00A0\v|\v | \v)+/g, '\n')
      .replace(/(\t\u00A0|\u00A0\t|\t | \t)+/g, '\n')
      .replace(/[\n\r\t\v]+/g, '\n');
  } catch (err) {
    cb(err, null);
    return;
  }

  cb(null, text);
}

export function extract(filePath: string, options: { includeAltText?: any } = {}, cb: CallbackType) {
  fs.readFile(filePath, (error, data) => {
    if (error) {
      cb(error, null);
      return;
    }
    extractFromText(data, options, cb);
  });
}

export const types = ['text/html', 'text/xml', 'application/xml', 'application/rss+xml', 'application/atom+xml'];
