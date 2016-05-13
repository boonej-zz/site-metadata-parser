var assert = require('chai').assert;
var Parser = require('../build/parser');
var expect = require('expect');

var params = {
  host: 'www.google.com'
};

describe('Parser', function() {
  
  describe('()', function() {
    it ('should not fail if host is provided', function() {
      expect(function() {
        new Parser(params);
      }).toNotThrow();
    });
  });

  describe('parse()', function() {
    it ('should not throw an exception if callback is provided', function() {
      expect(function() {
        new Parser(params).parse(function(data) {
  
        });
      }).toNotThrow();
    });

    it ('should return a valid object upon completion', function(done) {
      this.timeout(10000);
      new Parser({host: 'www.youtube.com', path: '/watch?v=hrxkjRXk7m8'})
      .parse(function(object) {
        if (typeof object !== 'object') {
          throw('Invalid object type returned.');
        }
        done();
      });
    });
  });

});
