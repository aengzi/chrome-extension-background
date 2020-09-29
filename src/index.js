import axios from 'axios';
import moment from 'moment';

let apiUrl;

if (process.env.NODE_ENV === 'production') {
  apiUrl = 'http://1-1-0.api.aengzi.com';
} else if (process.env.NODE_ENV === 'development') {
  apiUrl = 'http://localhost/aengzi-api';
}

axios.defaults.headers.common = {
  'Content-Type': 'application/json',
};

chrome.browserAction.onClicked.addListener(() => {
  chrome.tabs.create({
    url: chrome.extension.getURL('main/index.html'),
  });
});

chrome.webRequest.onHeadersReceived.addListener((details) => {
  const baseUrl = chrome.extension.getURL('').substr(0, chrome.extension.getURL('').length - 1);
  const headers = details.responseHeaders;
  const initUrl = details.initiator;
  const { url } = details;
  const isReqUrl = initUrl.match(new RegExp(`^${baseUrl}`));
  const isWantUrl = url.match(new RegExp('^http://101.79.136.27/'))
    || url.match(new RegExp('^http://101.79.136.36/'))
    || url.match(new RegExp('^http://211.110.86.208/'))
    || url.match(new RegExp('^http://vod-archive-kr-cdn-z01.afreecatv.com/'))
    || url.match(new RegExp('^http://.+api.aengzi.com/'))
    || url.match(new RegExp('^https://storage.googleapis.com/aengzi.com/'));

  if (isReqUrl && isWantUrl) {
    headers.push({
      name: 'Access-Control-Allow-Origin',
      value: '*',
    });
  }

  return {
    responseHeaders: headers,
  };
}, {
  urls: [
    'http://*.aengzi.com/',
    'http://101.79.136.27/*',
    'http://101.79.136.36/*',
    'http://211.110.86.208/*',
    'http://vod-archive-kr-cdn-z01.afreecatv.com/*',
    'https://storage.googleapis.com/aengzi.com/*',
  ],
}, [
  'blocking',
  'responseHeaders',
  'extraHeaders',
]);

setInterval(() => {
  if (moment.utc().format('HH:mm') !== '00:00') {
    return;
  }
  /* eslint-disable no-underscore-dangle */
  chrome.instanceID.getID((instanceId) => {
    axios.post(`${apiUrl}/devices`, {
      related_id: instanceId,
      related_type: 'chrome',
    }).then((obj) => obj.data.result).then((device) => {
      axios.patch(`${apiUrl}/devices/${device._attributes.id}`, {
        related_id: instanceId,
        related_type: 'chrome',
      });
      axios.get(`${apiUrl}/notifications`, {
        params: {
          after: moment.utc().format('YYYY-MM-DD HH:mm:ss'),
        },
      }).then((obj) => obj.data.result.data).then((notifications) => {
        notifications.forEach((notification) => {
          chrome.notifications.create(null, {
            type: 'basic',
            iconUrl: './main/assets/img/aengzi_icon_origin.jpg',
            title: notification._attributes.type,
            message: notification._attributes.description,
            buttons: [
              { title: '확인' },
            ],
            priority: 0,
          });
        });
      });
    });
  });
}, 60 * 1000);

chrome.notifications.create('init', {
  type: 'basic',
  iconUrl: './main/assets/img/aengzi_icon_origin.jpg',
  title: '설치 성공',
  message: 'BJ 앵지 확장프로그램을 설치해주셔서 감사합니다.',
  buttons: [
    { title: '확인' },
  ],
  priority: 0,
});

chrome.notifications.onButtonClicked.addListener(() => {
  chrome.tabs.create({
    url: chrome.extension.getURL('main/index.html'),
  });
});
chrome.notifications.onClicked.addListener(() => {
  chrome.tabs.create({
    url: chrome.extension.getURL('main/index.html'),
  });
});
chrome.notifications.onClosed.addListener(() => {
  chrome.tabs.create({
    url: chrome.extension.getURL('main/index.html'),
  });
});
