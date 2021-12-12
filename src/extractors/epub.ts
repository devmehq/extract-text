import { EPub } from 'epub2';
import { extractFromText } from './html';
import { CallbackType } from '../util';

export function extract(filePath: string, options: { includeAltText: any }, cb: CallbackType) {
  const epub = new EPub(filePath);
  let allText = '',
    hasError = false,
    chapterCount = 0;
  epub.on('end', () => {
    // Iterate over each chapter...
    epub.flow.forEach((chapter) => {
      // if already error, don't do anything
      if (!hasError) {
        // Get the chapter text
        epub.getChapterRaw(chapter.id, (rawChapterError, text) => {
          if (rawChapterError) {
            hasError = true;
            cb(rawChapterError, null);
          } else {
            // Extract the raw text from the chapter text (it's html)
            extractFromText(text, options, (htmlExtractError, outText) => {
              if (htmlExtractError) {
                hasError = true;
                cb(htmlExtractError, null);
              } else {
                allText += outText;
                chapterCount++;
                if (chapterCount === epub.flow.length) {
                  cb(null, allText);
                }
              }
            });
          }
        });
      }
    });
  });

  epub.parse();
}

export const types = ['application/epub+zip'];
