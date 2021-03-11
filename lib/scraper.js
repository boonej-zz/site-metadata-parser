var https = require('https');
const EventEmitter = require('events');

class ParserEmitter extends EventEmitter {}

var Scraper = function (args) {
  if (!(typeof args !== 'undefined')) {
    throw new Error('must provide an arguments object');
  }

  if (!(typeof args === 'object')) {
    throw new Error('must provide an object type for arguments');
  }

  if (!(typeof args.host === 'string' || typeof args.url === 'string')) {
    throw new Error('must provide a string for host OR url argument');
  }

  if (!(typeof args.host === 'string' && stripProtocol(args.host).split('/').length < 2 || typeof args.url === 'string')) {
    throw new Error('host must not contain path');
  }

  // constants


  const HEAD_OPEN_TAG = '<head>';
  const HEAD_CLOSE_TAG = '</head>';
  const STOP_PARSING = 'stopParsing';
  const EMITTER = new ParserEmitter();

  // public properties

  // private properties
  var host = args.host ? stripProtocol(args.host) : false; // host name (no protocol - www.xxx.xxx)
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
    if (!(typeof u === 'string')) {
      throw new Error('string value must be provided');
    }

    var pattern = new RegExp('^(https?:\\/\\/)?' + '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.?)+[a-z]{2,}|' + '((\\d{1,3}\\.){3}\\d{1,3}))' + '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + '(\\?[;&a-z\\d%_.~+=-]*)?' + '(\\#[-a-z\\d_]*)?$', 'i');
    return pattern.test(u);
  };

  // public methods
  this.scrape = function startParseOperation(callback) {
    const _startParseOperationPostcondition = (it) => {
      return it;
    };

    if (!(typeof url === 'string' && host === false || typeof host === 'string' && url === false)) {
      throw new Error('must provide a valid string for URL OR host');
    }

    metaCallback = callback;

    if (url) {
      host = getHost(url);
      path = getPath(url);
    }

    var options = {
      host: host || host,
      path: path || path
    };

    https.request(options, afterConnection).end();

    _startParseOperationPostcondition();
  };

  this.getHost = function hostGetter() {
    return host;
  };

  // private functions

  function getHost(u) {
    if (!(typeof u === 'string')) {
      throw new Error('must provide a string argument');
    }

    var s = stripProtocol(u);
    s = s.split('/')[0];
    return s;
  }

  function getPath(u) {
    if (!(typeof u === 'string')) {
      throw new Error('must provide a string argument');
    }

    var s = stripProtocol(u);
    var a = s.split('/');
    a.shift();
    s = '/' + a.join('/');
    return s;
  }

  function stripProtocol(u) {
    if (!(typeof u === 'string')) {
      throw new Error('must provide a string argument');
    }

    return u.replace(/http[s]?:\/\//, '');
  }

  // receives initial connection response and forwards processing
  // if neccessary
  function afterConnection(response) {
    const _afterConnectionPostcondition = (it) => {
      if (!(response.statusCode === 200 || stopParsing === true)) {
        throw new Error('should not parse an invalid server response');
      }

      return it;
    };

    if (!(response !== null)) {
      throw new Error('response must not be null');
    }

    if (response.statusCode === 200) {
      tempData = '';

      response.on('error', afterError);
      response.on('data', afterData);
      response.on('end', afterEnd);
    } else {
      EMITTER.emit(STOP_PARSING);
    }

    _afterConnectionPostcondition();
  }

  // handles error - stops processing if error is received
  function afterError(err) {
    const _afterErrorPostcondition = (it) => {
      if (!(stopParsing === true)) {
        throw new Error('parsing should stop');
      }

      return it;
    };

    if (!(err !== null)) {
      throw new Error('error object cannot be null');
    }

    metaObject = null;
    metaError = err;
    EMITTER.emit(STOP_PARSING);

    _afterErrorPostcondition();
  }

  // receive data blocks - only accepting the head element
  function afterData(chunk) {
    if (!(chunk != null)) {
      throw new Error('must provide data in chunks');
    }

    if (!(typeof tempData === 'string')) {
      throw new Error('temp data object must be a string');
    }

    if (finishedReadingHead) {
      return;
    }

    var td = chunk.toString();

    if (!startedReadingHead) {
      var headOpenPosition = td.indexOf(HEAD_OPEN_TAG);

      if (headOpenPosition !== -1) {
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
    const _afterHeadReceivedPostcondition = (it) => {
      if (!(metaObject !== null)) {
        throw new Error('meta object should not be null');
      }

      return it;
    };

    if (!(metaError === null)) {
      throw new Error('no errors should have occurred before processing');
    }

    metaObject = new metaParser().parse(tempData, {});
    EMITTER.emit(STOP_PARSING);

    _afterHeadReceivedPostcondition();
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
var metaParser = function () {

  var tags = [];

  this.parse = function parseHead(head) {
    if (!(typeof head === 'string')) {
      throw new Error('head parameter must be populated with a string');
    }

    tags = parseMeta(head);
    var metaData = extractProperties(tags);
    return metaData;
  };

  function clearBuffer() {
    buffer = '';
  }

  function parseMeta(text) {
    const _parseMetaPostcondition = (it) => {
      if (!(parsedObject !== null)) {
        throw new Error('will not return a null value');
      }

      if (!(typeof parsedObject === 'string')) {
        throw new Error('must return a string value');
      }

      return it;
    };

    if (!(typeof text === 'string')) {
      throw new Error('must provide a string to parse');
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

    return _parseMetaPostcondition(parsedObject);
  }

  function validateLine(line) {
    if (!(typeof line === 'string')) {
      throw new Error('must provide a string value');
    }

    return line.toLowerCase().indexOf('<meta') !== -1;
  }

  function extractProperties(text) {
    if (!(typeof text === 'string')) {
      throw new Error('text property must be a string');
    }

    var keys = [];
    var object = {};

    var regExString = '[name|property]="([^"]*)" content="([^"]*)"';
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
    if (!(typeof key === 'string')) {
      throw new Error('must provide string value for key');
    }

    var keyParts = key.split(/:|_/);

    if (keyParts.length > 1) {
      for (var i = 0; i != keyParts.length; ++i) {
        switch (i) {
          case 0:
            keyParts[i] = keyParts[i].toLowerCase();
            break;
          default:
            keyParts[i] = keyParts[i].substr(0, 1).toUpperCase() + keyParts[i].substr(1).toLowerCase();
            break;
        }
      }
    }
    return keyParts.join('');
  }
};

module.exports = Scraper;
