var https = require('https');
const EventEmitter = require('events');

class ParserEmitter extends EventEmitter{}

var Scraper = function(args){
  
  pre: {
    typeof args !== 'undefined', 'must provide an arguments object';
    typeof args === 'object', 'must provide an object type for arguments';
    typeof args.host === 'string' || typeof args.url === 'string', 
      'must provide a string for host OR url argument';
    (typeof args.host === 'string' && stripProtocol(args.host).split('/').length < 2) || typeof args.url === 'string',
      'host must not contain path';
  }


  // constants
  const HEAD_OPEN_TAG = '<head>';
  const HEAD_CLOSE_TAG = '</head>';
  const STOP_PARSING = 'stopParsing';
  const EMITTER = new ParserEmitter();

  // public properties
  
  // private properties
  var host = args.host
    ? stripProtocol(args.host)
    : false; // host name (no protocol - www.xxx.xxx)
  var path = args.path || '/'; // url path (/xxx.html)
  var url = args.url || false; // Full URL

  var stopParsing = false; // should we stop parsing data?
  var startedReadingHead = false; // did we begin reading the head?
  var finishedReadingHead = false; // did we finish reading all of the head?

  var tempData = null; // temporary data storage
  var metaObject = null; // parsed meta object
  var metaError = null; // error object provided to callback
  var metaCallback = null; // callback provided to requestor
  
  // Handle DONE emitter
  EMITTER.on(STOP_PARSING, afterStopParsing);

  this.metaParser = new metaParser(); 

  this.isValidUrl = function (u) {
    pre: {
      typeof u === 'string', 'string value must be provided';
    }

    var pattern = new RegExp(
        '^(https?:\\/\\/)?' +
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.?)+[a-z]{2,}|' +
        '((\\d{1,3}\\.){3}\\d{1,3}))' +
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' +
        '(\\?[;&a-z\\d%_.~+=-]*)?' +
        '(\\#[-a-z\\d_]*)?$','i');
    return pattern.test(u);
  };

  // public methods
  this.scrape = function startParseOperation(callback){
    pre: {
      (typeof url === 'string' && host === false) || (typeof host === 'string' && url === false), 'must provide a valid string for URL OR host';      
    }

    metaCallback = callback;
  
    if (url) {
      host = getHost(url);
      path = getPath(url);
    }

    var options = {
      host: host || host,
      path: path || path
    }

    https.request(options, afterConnection).end();

    post: {

    }
  };

  this.getHost = function hostGetter(){
    return host;
  }

  
  // private functions
  
  function getHost(u){
    pre: {
      typeof u === 'string', 'must provide a string argument';
    }
    var s = stripProtocol(u);
    s = s.split('/')[0];
    return s;
  }
  
  function getPath(u){
    pre: {
      typeof u === 'string', 'must provide a string argument';
    }
    var s = stripProtocol(u);
    var a = s.split('/');
    a.shift();
    s = '/' + a.join('/');
    return s;
  }
  
  function stripProtocol(u){
    pre: {
      typeof u === 'string', 'must provide a string argument';
    }

    return u.replace(/http[s]?:\/\//, '');
  }

  // receives initial connection response and forwards processing
  // if neccessary
  function afterConnection(response){
    pre: {
      response !== null, 'response must not be null',
      typeof response === 'object', 'response must be a valid object'
    }


    if (response.statusCode === 200){
      tempData = '';

      response.on('error', afterError);
      response.on('data', afterData);
      response.on('end', afterEnd);
    } else {
      EMITTER.emit(STOP_PARSING);
    }

    post: {
      response.statusCode === 200 || stopParsing === true, 
        'should not parse an invalid server response'
    }
  }

  // handles error - stops processing if error is received
  function afterError(err){
    pre: {
      err !== null, 'error object cannot be null';
    }

    metaObject = null;
    metaError = err;
    EMITTER.emit(STOP_PARSING);

    post: {
      stopParsing === true, 'parsing should stop';
    }
  }

  // receive data blocks - only accepting the head element
  function afterData(chunk){
    pre: {
      chunk != null, 'must provide data in chunks';
      typeof tempData === 'string', 'temp data object must be a string';
    }

    if (finishedReadingHead){
      return;
    }

    var td = chunk.toString();
    
    if (!startedReadingHead) {
      var headOpenPosition = td.indexOf(HEAD_OPEN_TAG);

      if (headOpenPosition !== -1){
        td = td.substr(headOpenPosition);
        startedReadingHead = true;
      }
    }

    var headClosePosition = td.indexOf(HEAD_CLOSE_TAG);

    if (headClosePosition !== -1) {
      td = td.substr(0, headClosePosition + HEAD_CLOSE_TAG.length);
      tempData += td;
      finishedReadingHead = true;
      afterHeadReceived(); 
      return;
    }
   
    if (startedReadingHead && !finishedReadingHead) {
      tempData += td;
    }
  }

  // initiate header processing
  function afterHeadReceived() {
    pre: {
      metaError === null, 'no errors should have occurred before processing';
    }

    metaObject = new metaParser().parse(tempData, {});
    EMITTER.emit(STOP_PARSING);

    post: {
      metaObject !== null, 'meta object should not be null';
    }
    
  }

  function afterEnd() {
    if (tempData.length === 0) {
      metaError = new Error('no head data received from server');
      EMITTER.emit(STOP_PARSING);
    }
  }

  function afterStopParsing() {
    stopParsing = true;
    if (typeof metaCallback == 'function') {
      metaCallback(metaError, metaObject);
    }
  }


};

// subclass to extract individual meta tags and process them
var metaParser = function() {

  var tags = [];

  this.parse = function parseHead(head) {
    pre: {
      typeof head === 'string', 'head parameter must be populated with a string';
    }
    
    tags = parseMeta(head); 
    var metaData = extractProperties(tags);
    return metaData;
  }

  function clearBuffer() {
    buffer = '';
  }

  function parseMeta(text) {
    pre: {
      typeof text === 'string', 'must provide a string to parse';
    }

    var buffer = '';
    var index = 0;
    var parsedObject = [];

    let counter = 0;
    let keepReading = false;

    while (counter < text.length) {
      var c = text[counter];
      
      if (c === '<') {
        keepReading = true;
      } else if (c === '>') {
        keepReading = false;
        buffer += c;
        if (validateLine(buffer)) {
          parsedObject.push(buffer);
        }
      }

      if (keepReading) {
        buffer += c;
      } else {
        buffer = '';
      }
      
      ++counter;
    }

    parsedObject = parsedObject.join('');

    return parsedObject;

    post: {
      parsedObject !== null, 'will not return a null value';
      typeof parsedObject === 'string', 'must return a string value';
    }
  }

  function validateLine(line) {
    pre: {
      typeof line === 'string', 'must provide a string value';
    }

    return line.toLowerCase().indexOf('<meta') !== -1;

  }

  function extractProperties(text) {
    pre: {
      typeof text === 'string', 'text property must be a string';
    }

    var keys = [];
    var object = {};


    var regExString = 
      '[name|property]="([^"]*)" content="([^"]*)"';
    var regEx = new RegExp(regExString, 'ig');
   
    var result; 

    while (result = regEx.exec(text)) {
      if (result.length > 2) {
        object[cleanKey(result[1])] = result[2];
      }
    }

    return object;
  }

  function cleanKey(key) {
    pre: {
      typeof key === 'string', 'must provide string value for key';
    }
  
    keyParts = key.split(/:|_/);
    
    if (keyParts.length > 1) {
      for (var i = 0; i != keyParts.length; ++i) {
        switch (i) {
          case 0:
            keyParts[i] = keyParts[i].toLowerCase();
            break;
          default:
            keyParts[i] = keyParts[i].substr(0, 1).toUpperCase() + 
              keyParts[i].substr(1).toLowerCase();
            break;
        }
      }
    }
    return keyParts.join('');
  }

}


module.exports = Scraper;
