var http = require('https');
var _ = require('underscore');

var connection = function (args, callback) {

  var onEnd = callback;

  var params = {
    host: false,
    path: false,
    port: 80
  };

  _.extend(params, _(args).pick(_(params).keys()));

  this.host = params.host;
  this.path = params.path;
  this.port = params.port;
  this.running = false;
  this.data = '';
  
  function afterResponse(response) {
    pre: response != null, 'Bad response received from server';
    response.on('data', afterData);
    response.on('end', afterEnd);
  }
  
  function afterData(chunk) {
    pre: {
      chunk !== null, 'No data received in response';
      this.data !== null;
    }
    if (chunk) {
      chunk = chunk.toString();
      this.data += chunk;
    }
  }
  

  function afterEnd() {
    if (typeof onEnd === 'function') {
      onEnd(this.data);
    }
    this.running = false;
  }

  this.start = function () {
    pre: {
      typeof this.host === 'string', 'Must provide a valid string for host. ';
      typeof this.path === 'string', 'Must provide a valid string for path. ';
    }
    
    var options = {
      host: this.host,
      path: this.path
    };

    this.data = '';
    http.request(options, afterResponse).end();
    this.running = true;
  }
}



module.exports = connection;
