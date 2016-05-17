var assert = require('chai').assert;
var Parser = require('../lib/parser');
var expect = require('expect');
var fs = require('fs');

var params = {
  host: 'www.google.com'
};

var testHTML = fs.readFileSync('spec/parsetest.ht');

describe('Parser', function() {
  
  describe('()', function() {

    it ('should throw an exception if no arguments are provided', function(){
      expect(function() {
        new Parser();
      }).toThrow('must provide an arguments object');
    });

    it ('should not fail if host is provided', function() {
      expect(function() {
        new Parser(params);
      }).toNotThrow();
    });

    it ('should throw exception if no host is provided', function(){
      expect(function(){
        new Parser({});
      }).toThrow('must provide a string for host argument');
    });

    it ('should strip protocol from an unsecure http url', function(){
      var p = new Parser({host: 'http://www.google.com'});
      expect(p.getHost()).toBe('www.google.com');
    });

    it ('should strip protocol from an unsecure https url', function(){
      var p = new Parser({host: 'https://www.google.com'});
      expect(p.getHost()).toBe('www.google.com');
    });

  });

  describe('scrape()', function() {
    it ('should not throw an exception if callback is provided', function() {
      expect(function() {
        new Parser(params).scrape(function(err, data) {
  
        });
      }).toNotThrow();
    });

    it ('should return a valid object upon completion', function(done) {
      this.timeout(10000);
      new Parser({host: 'www.youtube.com', path: '/watch?v=hrxkjRXk7m8'})
        .scrape(function(err, data) {
          if (typeof data !== 'object') {
            throw('Invalid object type returned.');
          }
          done();
        });

    });

    it ('should contain expected data upon completion', function(done) {
      this.timeout(10000);
      new Parser({host: 'www.youtube.com', path: '/watch?v=hrxkjRXk7m8'})
        .scrape(function(err, data) {
          if (data.ogImage !== 
            'https://i.ytimg.com/vi/hrxkjRXk7m8/maxresdefault.jpg') {
            throw('Unexpected return data.');
          }
          done();
        });

    });

  });

  describe('MetaParser', function(){

    describe('parse()', function(){
      it ('should create a valid object', function(done){
        var obj = new Parser(params).metaParser.parse(testHTML.toString());
        expect(obj.twitterAppIdIpad).toBe('544007664');
        done();
      });
    });

  });

});


