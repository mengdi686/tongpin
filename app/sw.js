const CACHE = 'tp-v8';
const ASSETS = ['./', './index.html', './styles.css', './app.js', './match.html', './match.css', './match.js', './manifest.json', './icon.svg',
  './assets/match/liujiajia.jpg', './assets/match/chenyu.jpg', './assets/match/linwan.jpg',
  './assets/match/zhouye.jpg', './assets/match/suqing.jpg',
  './assets/match/pool_a.jpg', './assets/match/pool_b.jpg', './assets/match/pool_c.jpg',
  './assets/match/pool_m1.jpg', './assets/match/pool_m2.jpg', './assets/match/pool_m3.jpg', './assets/match/pool_m4.jpg',
  './assets/match/pool_f1.jpg', './assets/match/pool_f2.jpg', './assets/match/pool_f3.jpg', './assets/match/pool_f4.jpg'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return;
  e.respondWith(
    caches.match(e.request).then(hit => hit || fetch(e.request).then(res => {
      const copy = res.clone();
      caches.open(CACHE).then(c => c.put(e.request, copy)).catch(() => {});
      return res;
    }).catch(() => caches.match('./index.html')))
  );
});
