var assert = require('chai').assert;
var Connection = require('../build/connection');
var expect = require('expect');
var con;

var params = {
  host: 'www.google.com',
  path: '/'
};

var after = function(){};

describe('Connection', function(){

  describe('start()', function() {
    it ('should begin script execution', function() {
      var con = new Connection(params, after);
      con.start();
      expect(con.running).toBeTruthy; 
    });

    it('should finish execution', function(done) {
      var con = new Connection(params, function(data){
        done();
      });
      con.start();
    });

    it('should return a string containting data', function(done) {
      new Connection(params, function(data) {
        if (typeof data !== 'string' && data.length < 1) {
          throw('Invalid data returned from execution');
        }
        done();
      }).start();
    });

    it('should fail if host is not present on execution', function() {
      expect(function(){
      new Connection({}, function(data) {
      }).start();
      }).toThrow('Must provide a valid string for host.');
    });

  });

});
