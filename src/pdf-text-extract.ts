import path from 'path';
import { spawn, SpawnOptionsWithoutStdio } from 'child_process';
import { CallbackType } from './util';

/**
 * spawns pdftotext and returns its output
 */
function streamResults(
  command: string,
  args: any[] | readonly string[],
  options: SpawnOptionsWithoutStdio,
  cb: (error: Error, result?: string) => any
) {
  let output: string = '';
  let stderr: string = '';

  function stdoutHandler(data: string) {
    output += data;
  }

  function stderrHandler(data: string) {
    stderr += data;
  }

  function closeHandler(code: number) {
    if (code !== 0) {
      return cb(new Error(`pdf-text-extract command failed: ${stderr}`));
    }
    return cb(null, output);
  }

  const child = spawn(command, args, options);
  child.stdout.setEncoding('utf8');
  child.stderr.setEncoding('utf8');
  child.stdout.on('data', stdoutHandler);
  child.stderr.on('data', stderrHandler);
  child.on('close', closeHandler);
}

export function extract(filePath: string, options: any, pdfToTextCommand: any, cb?: CallbackType | any) {
  if (!cb) {
    cb = pdfToTextCommand;
  }
  if (!pdfToTextCommand) {
    cb = options;
  }
  // options is optional
  if (typeof options === 'function') {
    cb = options;
    options = {};
  }
  if (typeof pdfToTextCommand === 'function') {
    cb = pdfToTextCommand;
    pdfToTextCommand = 'pdftotext';
  }
  if (!pdfToTextCommand) {
    pdfToTextCommand = 'pdftotext';
  }

  filePath = path.resolve(filePath);

  // [feat-promise] if cb is not a function, then it's probably a promise-typed call
  if (typeof cb !== 'function') {
    cb = null;
  }

  // [feat-promise] options have to be not null
  if (!options) {
    options = {} as any;
  }

  // default options
  options.encoding = options.encoding || 'UTF-8';
  options.layout = options.layout || 'layout';
  options.splitPages = options.splitPages !== false;

  // Build args based on options
  const args = [];

  // First and last page to convert
  if (options.firstPage) {
    args.push('-f');
    args.push(options.firstPage);
  }
  if (options.lastPage) {
    args.push('-l');
    args.push(options.lastPage);
  }

  // Resolution, in dpi. (null is pdftotext default = 72)
  if (options.resolution) {
    args.push('-r');
    args.push(options.resolution);
  }

  // If defined, should be an object { x:x, y:y, w:w, h:h }
  if (typeof options.crop === 'object') {
    if (options.crop.x) {
      args.push('-x');
      args.push(options.crop.x);
    }
    if (options.crop.y) {
      args.push('-y');
      args.push(options.crop.y);
    }
    if (options.crop.w) {
      args.push('-W');
      args.push(options.crop.w);
    }
    if (options.crop.h) {
      args.push('-H');
      args.push(options.crop.h);
    }
  }

  // One of either 'layout', 'raw' or 'htmlmeta'
  if (options.layout === 'layout') {
    args.push('-layout');
  }
  if (options.layout === 'raw') {
    args.push('-raw');
  }
  if (options.layout === 'htmlmeta') {
    args.push('-htmlmeta');
  }

  // Output text encoding (UCS-2, ASCII7, Latin1, UTF-8, ZapfDingbats or Symbol)
  if (options.encoding) {
    args.push('-enc');
    args.push(options.encoding);
  }

  // Output end of line convention (unix, dos or mac)
  if (options.eol) {
    args.push('-eol');
    args.push(options.eol);
  }

  // Owner and User password (for encrypted files)
  if (options.ownerPassword) {
    args.push('-opw');
    args.push(options.ownerPassword);
  }
  if (options.userPassword) {
    args.push('-upw');
    args.push(options.userPassword);
  }

  // finish up arguments
  args.push(filePath);
  args.push('-');

  function splitPages(err: any, content: string) {
    if (err) {
      return cb(err);
    }
    const pages = content.split(/\f/);
    if (!pages) {
      return cb({
        message: 'pdf-text-extract failed',
        error: 'no text returned from the pdftotext command',
        filePath: filePath,
        stack: new Error().stack,
      });
    }
    // sometimes there can be an extract blank page on the end
    if (!pages[pages.length - 1]) {
      pages.pop();
    }
    return cb(null, pages);
  }

  // [feat-promise]
  // if cb is not defined, then it's probably a promise-typed call
  // in order to use promise, instantiation is required
  if (!cb) {
    // this.pdfToTextCommand = pdfToTextCommand;
    // this.args = args;
    // this.options = options;
    // this.splitPages = splitPages;
    // this.filePath = filePath;
  } else {
    streamResults(pdfToTextCommand, args, options, options.splitPages ? splitPages : cb);
  }
}

/**
 * [feat-promise]
 * Promise support
 *
 * @param {Function} resolve
 * @param {Function} [reject]
 * @return {Request}
 */
extract.prototype.then = function (resolve: (arg0: any) => void, reject: any) {
  /**
   * Duplicated from function splitPages of streamResults
   */
  function streamResultsPromise(
    command: string,
    args: readonly string[],
    options: SpawnOptionsWithoutStdio,
    cb: { (content: any): void; (arg0: string): void }
  ) {
    let output = '';
    let stderr = '';

    function stdoutHandler(data: string) {
      output += data;
    }

    function stderrHandler(data: string) {
      stderr += data;
    }

    function closeHandler(code: number) {
      if (code !== 0) {
        throw new Error(`pdf-text-extract command failed: ${stderr}`);
      }
      cb(output);
    }

    const child = spawn(command, args, options);
    child.stdout.setEncoding('utf8');
    child.stderr.setEncoding('utf8');
    child.stdout.on('data', stdoutHandler);
    child.stderr.on('data', stderrHandler);
    child.on('close', closeHandler);
  }

  /**
   * Duplicated from function splitPages of pdfTextExtract
   */
  function splitPagesPromise(content: string) {
    const pages = content.split(/\f/);
    if (!pages) {
      throw new Error('pdf-text-extract failed');
    }
    // sometimes there can be an extract blank page on the end
    if (!pages[pages.length - 1]) {
      pages.pop();
    }
    resolve(pages);
  }

  // todo fix
  if (!this._fullfilledPromise) {
    const self = this;
    this._fullfilledPromise = new Promise(() => {
      streamResultsPromise(
        self.pdfToTextCommand,
        self.args,
        self.options,
        self.options.splitPages ? splitPagesPromise : resolve
      );
    });
  }

  return this._fullfilledPromise.then(resolve, reject);
};
