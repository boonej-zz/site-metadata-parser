lite-meta-scraper
===============================================================================
*A lightweight metadata parser for remote HTML pages.*

-------------------------------------------------------------------------------

This library is meant to provide a fast, lightweight method to strip the 
content of `<meta>` tags from remote websites. It is intended to be 
specification agnostic, meaning that all meta tags with a `content` field are 
stripped and returned in a JSON object.

Install
-------------------------------------------------------------------------------
```
npm install lite-meta-scraper
```

Usage
-------------------------------------------------------------------------------
```javascript
var Scraper = require('lite-meta-scraper');

new Scraper({
  host: 'www.somesite.com',
  path: '/'
}).scrape(function(err, data) {
  // do something with data
});
```

Example Output 
-------------------------------------------------------------------------------
```javascript
{ 
  title: 'Unsportsmanlike Conduct 2010',
  description: ' ',
  keywords: 'Unsportsmanlike, Conduct, 2010',
  'theme-color': '#e62117',
  ogSiteName: 'YouTube',
  ogUrl: 'https://www.youtube.com/watch?v=0YIaOdft8RM',
  ogTitle: 'Unsportsmanlike Conduct 2010',
  ogImage: 'https://i.ytimg.com/vi/0YIaOdft8RM/hqdefault.jpg',
  ogDescription: ' ',
  alIosAppStoreId: '544007664',
  alIosAppName: 'YouTube',
  alIosUrl: 
    'vnd.youtube://www.youtube.com/watch?v=0YIaOdft8RM&amp;feature=applinks',
  alAndroidUrl: 
    'vnd.youtube://www.youtube.com/watch?v=0YIaOdft8RM&amp;feature=applinks',
  alAndroidAppName: 'YouTube',
  alAndroidPackage: 'com.google.android.youtube',
  alWebUrl: 'https://www.youtube.com/watch?v=0YIaOdft8RM&amp;feature=applinks',
  ogType: 'video',
  ogVideoUrl: 'http://www.youtube.com/v/0YIaOdft8RM?version=3&amp;autohide=1',
  ogVideoSecureUrl: 
    'https://www.youtube.com/v/0YIaOdft8RM?version=3&amp;autohide=1',
  ogVideoType: 'application/x-shockwave-flash',
  ogVideoWidth: '480',
  ogVideoHeight: '360',
  ogVideoTag: '2010',
  fbAppId: '87741124305',
  twitterCard: 'player',
  twitterSite: '@youtube',
  twitterUrl: 'https://www.youtube.com/watch?v=0YIaOdft8RM',
  twitterTitle: 'Unsportsmanlike Conduct 2010',
  twitterDescription: ' ',
  twitterImage: 'https://i.ytimg.com/vi/0YIaOdft8RM/hqdefault.jpg',
  twitterAppNameIphone: 'YouTube',
  twitterAppIdIphone: '544007664',
  twitterAppNameIpad: 'YouTube',
  twitterAppIdIpad: '544007664',
  twitterAppUrlIphone: 
    'vnd.youtube://www.youtube.com/watch?v=0YIaOdft8RM&amp;feature=applinks',
  twitterAppUrlIpad: 
    'vnd.youtube://www.youtube.com/watch?v=0YIaOdft8RM&amp;feature=applinks',
  twitterAppNameGoogleplay: 'YouTube',
  twitterAppIdGoogleplay: 'com.google.android.youtube',
  twitterAppUrlGoogleplay: 'https://www.youtube.com/watch?v=0YIaOdft8RM',
  twitterPlayer: 'https://www.youtube.com/embed/0YIaOdft8RM',
  twitterPlayerWidth: '480',
  twitterPlayerHeight: '360',
  name: 'Unsportsmanlike Conduct 2010',
  paid: 'False',
  channelId: 'UCISM9oG5fQF43Csgmj6C9Yg',
  videoId: '0YIaOdft8RM',
  duration: 'PT14M3S',
  unlisted: 'False',
  width: '480',
  height: '360',
  playerType: 'HTML5 Flash',
  isFamilyFriendly: 'True',
  regionsAllowed: 'AD,AE,AF,AG,AI,AL,AM,AO,AQ,AR,AS,AT,AU,AW,AX,AZ,BA,BB,BD,BE,
  BF,BG,BH,BI,BJ,BL,BM,BN,BO,BQ,BR,BS,BT,BV,BW,BY,BZ,CA,CC,CD,CF,CG,CH,CI,CK,
  CL,CM,CN,CO,CR,CU,CV,CW,CX,CY,CZ,DE,DJ,DK,DM,DO,DZ,EC,EE,EG,EH,ER,ES,ET,FI,
  FJ,FK,FM,FO,FR,GA,GB,GD,GE,GF,GG,GH,GI,GL,GM,GN,GP,GQ,GR,GS,GT,GU,GW,GY,HK,
  HM,HN,HR,HT,HU,ID,IE,IL,IM,IN,IO,IQ,IR,IS,IT,JE,JM,JO,JP,KE,KG,KH,KI,KM,KN,
  KP,KR,KW,KY,KZ,LA,LB,LC,LI,LK,LR,LS,LT,LU,LV,LY,MA,MC,MD,ME,MF,MG,MH,MK,ML,
  MM,MN,MO,MP,MQ,MR,MS,MT,MU,MV,MW,MX,MY,MZ,NA,NC,NE,NF,NG,NI,NL,NO,NP,NR,NU,
  NZ,OM,PA,PE,PF,PG,PH,PK,PL,PM,PN,PR,PS,PT,PW,PY,QA,RE,RO,RS,RU,RW,SA,SB,SC,
  SD,SE,SG,SH,SI,SJ,SK,SL,SM,SN,SO,SR,SS,ST,SV,SX,SY,SZ,TC,TD,TF,TG,TH,TJ,TK,
  TL,TM,TN,TO,TR,TT,TV,TW,TZ,UA,UG,UM,US,UY,UZ,VA,VC,VE,VG,VI,VN,VU,WF,WS,YE,
  YT,ZA,ZM,ZW',
  interactionCount: '5929031',
  datePublished: '2011-02-03',
  genre: 'People &amp; Blogs' 
}
```

TO DO
-------------------------------------------------------------------------------
*  Accept full URL and host in addition to specifying host and path.

