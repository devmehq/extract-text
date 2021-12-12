import path from 'path';
import { fromFileWithPath } from './index';

module.exports = function (filePath: string, flags: { preserveLineBreaks: string | boolean }) {
  filePath = path.resolve(process.cwd(), filePath);

  flags.preserveLineBreaks = flags.preserveLineBreaks !== 'false';

  fromFileWithPath(filePath, flags, (error: any, text: any) => {
    if (error) {
      // eslint-disable-next-line no-console
      console.error(error);
    } else {
      // eslint-disable-next-line no-console
      console.log(text);
    }
  });
};
