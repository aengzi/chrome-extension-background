import * as _ from 'lodash';

const setHeader = (headers, newHeader) => {

  const names = _.map(headers, (header) => header.name.toLowerCase());
  const index = names.indexOf(newHeader.name.toLowerCase());

  if (index === -1) {
    headers.push(newHeader);
  } else {
    headers[index].name  = newHeader.name;
    headers[index].value = newHeader.value;
  }

  return headers;
};

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

chrome.browserAction.onClicked.addListener((tab) => {

  chrome.tabs.create({
    url: chrome.extension.getURL('main/index.html')
  });
});

chrome.webRequest.onBeforeRequest.addListener((details) => {

  return {
    redirectUrl: details.url.replace('http://videofile-hls-ko-record-cf.afreecatv.com', 'http://hls-hot.afreecatv.com')
  };
}, {
  urls: [
    'http://videofile-hls-ko-record-cf.afreecatv.com/*'
  ]
}, [
  'blocking'
]);

chrome.webRequest.onBeforeSendHeaders.addListener((details) => {

  const baseUrl  = chrome.extension.getURL('').substr(0, chrome.extension.getURL('').length - 1);
  const headers  = details.requestHeaders;
  const url      = details.url;
  const initUrl  = details.initiator;
  const isReqUrl = _.startsWith(initUrl, baseUrl);
  const vodId    = url.match(/\?(.*)/) != null ? new URLSearchParams(url.match(/\?(.*)/)[1]).get('aftvcontid') : null;

  if (_.startsWith(url, 'http://pa.afreecatv.com/')) {
    setHeader(headers, {
      name: 'Accept',
      value: 'application/xml, text/xml, */*; q=0.01'
    });
    setHeader(headers, {
      name: 'DNT',
      value: '1'
    });
    setHeader(headers, {
      name: 'Origin',
      value: 'http://vod.afreecatv.com'
    });
    setHeader(headers, {
      name: 'Referer',
      value: 'http://vod.afreecatv.com/PLAYER/STATION/'+vodId
    });
  }

  return {
    requestHeaders: headers
  };
}, {
  urls: [
    'http://*.afreecatv.com/*'
  ]
}, [
  'blocking',
  'requestHeaders',
  'extraHeaders'
]);

chrome.webRequest.onHeadersReceived.addListener((details) => {

  const baseUrl   = chrome.extension.getURL('').substr(0, chrome.extension.getURL('').length - 1);
  const headers   = details.responseHeaders;
  const initUrl   = details.initiator;
  const url       = details.url;
  const isReqUrl  = _.startsWith(initUrl, baseUrl);
  const isWantUrl =
    _.startsWith(url, 'http://101.79.136.27/') ||
    _.startsWith(url, 'http://101.79.136.36/') ||
    _.startsWith(url, 'http://101.79.240.226/') ||
    _.startsWith(url, 'http://101.79.240.227/') ||
    _.startsWith(url, 'http://101.79.240.232/') ||
    _.startsWith(url, 'http://112.175.138.131/') ||
    _.startsWith(url, 'http://112.175.63.2/') ||
    _.startsWith(url, 'http://125.209.207.87/') ||
    _.startsWith(url, 'http://125.209.207.88/') ||
    _.startsWith(url, 'http://183.111.26.106/') ||
    _.startsWith(url, 'http://183.111.26.116/') ||
    _.startsWith(url, 'http://183.111.26.123/') ||
    _.startsWith(url, 'http://211.110.86.208/') ||
    _.startsWith(url, 'http://211.110.86.210/') ||
    _.startsWith(url, 'http://211.110.86.211/') ||
    _.startsWith(url, 'http://hls-hot.afreecatv.com/') ||
    _.startsWith(url, 'http://videofile-hls-ko-record-cf.afreecatv.com/') ||
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
