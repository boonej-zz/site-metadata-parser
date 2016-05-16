light-html-meta
===============================================================================
A lightweight metadata parser for remote HTML pages.
-------------------------------------------------------------------------------
This library is meant to provide a fast, lightweight method to strip the 
content of `<meta>` tags from remote websites. It is intended to be 
specification agnostic, meaning that all meta tags with a `content` field are 
stripped and returned in a JSON object.

Install
-------------------------------------------------------------------------------
```
npm install light-html-meta
```

Usage
-------------------------------------------------------------------------------
```javascript
var Scraper = require('light-html-meta');

new Scraper({
  host: 'www.somesite.com',
  path: '/'
}).parse(function(err, data) {
  // do something with data
});
```
