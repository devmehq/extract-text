const { exec } = require('child_process'),
  path = require('path'),
  cliPath = path.join(__dirname, '..', 'bin', 'textract'),
  testFilePath = path.join(__dirname, 'files', 'css.css');

describe('cli', () => {
  it('will extract text', (done) => {
    exec(`${cliPath} ${testFilePath}`, (error, stdout, stderr) => {
      expect(stdout).to.eql('.foo {color:red}\n');
      done();
    });
  });
});
