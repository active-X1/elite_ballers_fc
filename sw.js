const CACHE="elite-ballers-v5";
const CORE=[
  "./","./index.html","./about.html","./team.html","./fixtures.html","./results.html",
  "./gallery.html","./news.html","./contact.html","./404.html",
  "./css/style.css","./css/responsive.css","./css/app-ui.css",
  "./js/theme.js","./js/main.js","./js/app-ui.js","./js/public-ui.js","./js/sb-renderers.js",
  "./manifest.webmanifest","./assets/app-icon.svg","./assets/icons/icon-192.png","./assets/icons/icon-512.png",
  "./assets/images/logo.png","./assets/images/team.jpg"
];

self.addEventListener("install",event=>{
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(CORE)).then(()=>self.skipWaiting()));
});
self.addEventListener("activate",event=>{
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener("fetch",event=>{
  if(event.request.method!=="GET") return;
  const url=new URL(event.request.url);
  if(url.origin!==location.origin || url.pathname.includes("/admin/")) return;

  if(event.request.mode==="navigate"){
    event.respondWith(
      fetch(event.request).then(response=>{
        if(response.ok){
          const copy=response.clone();
          caches.open(CACHE).then(c=>c.put(event.request,copy));
        }
        return response;
      }).catch(()=>caches.match(event.request).then(r=>r||caches.match("./index.html")))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cached=>{
      if(cached) return cached;
      return fetch(event.request).then(response=>{
        if(response.ok){
          const copy=response.clone();
          caches.open(CACHE).then(c=>c.put(event.request,copy));
        }
        return response;
      });
    })
  );
});
