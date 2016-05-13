var Connection = require('./connection');
var _ = require('underscore');
var http = require('http');
var htmlparser = require('htmlparser');

var metaMap = {
  'og:name'             : 'name',
  'og:description'      : 'description',
  'og:type'             : 'type',
  'og:image'            : 'image',
  'og:url'              : 'url',
  'og:audio'            : 'audio',
  'og:determiner'       : 'determiner',
  'og:locale'           : 'locale',
  'og:site_name'        : 'siteName',
  'og:image:url'        : 'imageUrl',
  'og:image:secure_url' : 'imageSecureUrl',
  'og:image:type'       : 'imageType',
  'og:image:width'      : 'imageWidth',
  'og:image:height'     : 'imageHeight',
  'og:video'            : 'video',
  'og:video:secure_url' : 'videoSecureUrl',
  'og:video:type'       : 'videoType',
  'og:video:width'      : 'videoWidth',
  'og:video:height'     : 'videoHeight',
  'og:audio:secure_url' : 'audioSecureUrl',
  'og:audio:type'       : 'audioType'
};

var metaKeys = _.keys(metaMap);

var parser = function(args) {

  pre: {
    args.host !== null, 'host cannot be null';
  }

  var params = {
    host: false,
    path: '/'
  };

  _.extend(params, _(args).pick(_(params).keys()));

  var host = params.host;
  var path = params.path || '/';

  var metaObject = {};
  var $callback = null;

  this.parse = function(callback) {
    pre: typeof callback === 'function', 'must provide a callback function.';
    
    $callback = callback; 

    new Connection({
      host: host,
      path: path
    }, afterConnection).start();
  }

  function afterConnection(data) {
    var head = trimHead(data);
    parseHead(head);
  }

  function trimHead(doc) {
      pre: {
        typeof doc === 'string', 'only string values may be passed';
        doc.length > 0, 'document must contain data';
        doc.indexOf('</head>') > doc.indexOf('<head>'), 
          'must contain opening and closing head elements';
      }

      var start = doc.indexOf('<head>');
      var end = doc.indexOf('</head>');
      var result = doc.substr(start, end + 7 - start);
      /** 
      post: {
        typeof result === 'string', 'will return a string value';
        result.substr(0, 6) === '<head>', 'will begin with head tag';
        result.substr(result.length - 7) === '</head>', 
          'will contain closing head tag';
      }
      **/

      return result;
  }

  function parseHead(head) {

    pre: {
      typeof head === 'string', 'head parameter must be a string';
      head.length > 1, 'head parameter must contain data';
      head.substr(0, 6) === '<head>', 'must begin with a head tag';
      head.substr(head.length - 7) === '</head>', 'must end with a closing tag';
    }

    var handler = new htmlparser.DefaultHandler(htmlHandler);
    var parser = new htmlparser.Parser(handler);
    parser.parseComplete(head);

  }

  function extractMeta(dom) {
    pre: {
      dom !== null, 'must provide a valid document for traversal';
    };
    
    _.each(dom, function(node, i, l) {
      if (node.name === 'meta') {
        if (node.attribs.name || node.attribs.property) {
          var accessor = node.attribs.name
            ? 'name'
            : 'property';
          handleMetaTag(node.attribs, accessor);
        }
      } else if (node.children && node.children.length > 0) {
        extractMeta(node.children);
      }
    });
    
  }

  function handleMetaTag(tag, accessor) {
    pre: {
      tag !== null, 'must pass a non null object';
      accessor === 'name' || accessor === 'property', 
               'accessor must be either -name- or -property-';
      tag[accessor] !== null, 'tag must contain a property with accessor name';
    }
    var metaIndex = metaKeys.indexOf(tag[accessor]);
    if (metaIndex !== -1) {
      metaObject[metaMap[tag[accessor]]] = tag.content;
    }
  }


  function htmlHandler(err, dom) {
    pre: {
      dom !== null, 'must provide a valid dom';
    }

    extractMeta(dom);
    $callback(metaObject);
  }

};

module.exports = parser;
