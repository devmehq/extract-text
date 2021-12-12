import { exec } from 'child_process';
import path from 'path';
import { expect } from 'chai';

const cliPath = path.join(__dirname, '..', 'bin', 'textract');
const testFilePath = path.join(__dirname, 'files', 'css.css');

describe('cli', () => {
  it('will extract text', (done) => {
    exec(`${cliPath} ${testFilePath}`, (error, stdout) => {
      expect(stdout).to.eql('.foo {color:red}\n');
      done();
    });
  });
});
