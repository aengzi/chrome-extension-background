import axios from 'axios';
import moment from 'moment';

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

let date = moment.utc().format('YYYY-MM-DD HH:mm:ss');

chrome.instanceID.getID((instanceId) => {
  const device = axios.post('http://1-1-0.api.aengzi.com/devices', {
    related_id: instanceId,
    related_type: 'chrome',
  });
  setInterval(() => {
    axios.patch(`http://1-1-0.api.aengzi.com/devices/${device.id}`, {
      related_id: instanceId,
      related_type: 'chrome',
    });
    const notificationList = axios.get('http://1-1-0.api.aengzi.com/notifications', {
      params: {
        after: date,
      },
    });

    notificationList.data.forEach((notification) => {
      chrome.notifications.create(notification.id, {
        type: 'basic',
        iconUrl: './main/assets/img/aengzi_icon_origin.jpg',
        title: notification.type,
        message: notification.description,
        buttons: [
          { title: '닫기.' },
        ],
        priority: 0,
      });
    });

    date = moment.utc().format('YYYY-MM-DD HH:mm:ss');
  }, 3600 * 1000);
});

chrome.notifications.create('init', {
  type: 'basic',
  iconUrl: './main/assets/img/aengzi_icon_origin.jpg',
  title: '설치 성공',
  message: 'BJ 앵지 확장프로그램을 설치해주셔서 감사합니다.',
  buttons: [
    { title: '닫기.' },
  ],
  priority: 0,
});

chrome.notifications.onClicked.addListener(() => {
  chrome.tabs.create({
    url: chrome.extension.getURL('main/index.html'),
  });
});
