/* global fromUrl */

const test = function (done) {
    return function (error, text) {
      expect(text).to.be.null;
      // expect(error).to.be.an('object');
      expect(error.message).to.be.an('string');
      expect(error.message).to.eql('Incorrect parameters passed to textract.');
      done();
    };
  },
  pathTests = function (testFunction) {
    let funct;

    beforeEach(() => {
      funct = testFunction();
    });

    it('should return an error 1', (done) => {
      funct(test(done));
    });

    it('should return an error 2', (done) => {
      funct(false, test(done));
    });

    it('should return an error 3', (done) => {
      funct(test(done), false);
    });

    it('should return an error 4', (done) => {
      funct('foo', test(done), false);
    });

    it('should return an error 5', (done) => {
      funct('foo', {}, false, test(done));
    });
  },
  bufferTests = function (testFunction) {
    let funct;

    beforeEach(() => {
      funct = testFunction();
    });

    it('should return an error 1', (done) => {
      funct(test(done));
    });

    it('should return an error 2', (done) => {
      funct(false, test(done));
    });

    it('should return an error 3', (done) => {
      funct(test(done), false);
    });

    it('should return an error 4', (done) => {
      funct('foo', test(done), false);
    });

    it('should return an error 5', (done) => {
      funct('foo', {}, false, test(done));
    });
  };

describe('when passed incorrect parameters', () => {
  describe('fromFileWithPath', () => {
    pathTests(() => global.fromFileWithPath, false);
  });

  describe('fromFileWithMimeAndPath', () => {
    pathTests(() => global.fromFileWithMimeAndPath, false);
  });

  describe('fromBufferWithName', () => {
    bufferTests(() => global.fromBufferWithName, false);
  });

  describe('fromBufferWithMime', () => {
    bufferTests(() => global.fromBufferWithMime, false);
  });
});
