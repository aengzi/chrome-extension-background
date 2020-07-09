import * as _ from 'lodash';

chrome.browserAction.onClicked.addListener((tab) => {

  chrome.tabs.create({
    url: chrome.extension.getURL('main/index.html')
  });
});

chrome.webRequest.onBeforeRequest.addListener((details) => {

  const url = chrome.extension.getURL('') + details.url.match(/^http:\/\/chrome-extension\.aengzi\.com\/(.*)/)[1];

  return {
    redirectUrl: url
  };
}, {
  urls: [
    'http://chrome-extension.aengzi.com/*'
  ],
  types: [
    'main_frame',
    'sub_frame',
    'stylesheet',
    'script',
    'image',
    'object',
    'xmlhttprequest',
    'other'
  ]
}, [
  'blocking'
]);

chrome.webRequest.onHeadersReceived.addListener((details) => {

  const baseUrl   = chrome.extension.getURL('').substr(0, chrome.extension.getURL('').length - 1);
  const headers   = details.responseHeaders;
  const initUrl   = details.initiator;
  const url       = details.url;
  const isReqUrl  = _.startsWith(initUrl, baseUrl);
  const isWantUrl =
    _.startsWith(url, 'http://api.aengzi.com/') ||
    _.startsWith(url, 'http://101.79.136.27/') ||
    _.startsWith(url, 'http://101.79.136.36/') ||
    _.startsWith(url, 'http://211.110.86.208/') ||
    _.startsWith(url, 'http://vod-archive-kr-cdn-z01.afreecatv.com/') ||
    _.startsWith(url, 'https://storage.googleapis.com/aengzi.com/')
;

  if (isReqUrl && isWantUrl) {
    headers.push({
      name: 'Access-Control-Allow-Origin',
      value: '*'
    });
  }

  return {
    responseHeaders: headers
  };
}, {
  urls: [
    "http://*/*",
    "https://*/*"
  ]
}, [
  'blocking',
  'responseHeaders',
  'extraHeaders'
]);
