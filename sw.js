const C="talabat-v2";
const PRE=["./","index.html","manifest.webmanifest","logo.jpg","logo-tight.jpg","lockup-white.png","hs.png","icon-192.png","icon-512.png","icon-maskable-512.png","apple-touch-icon.png"];
const CDN=["cdn.jsdelivr.net","fonts.googleapis.com","fonts.gstatic.com"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(C).then(c=>Promise.all(PRE.map(u=>c.add(u).catch(()=>{})))));self.skipWaiting()});
self.addEventListener("activate",e=>e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==C).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener("fetch",e=>{
  const r=e.request;if(r.method!=="GET")return;
  const u=new URL(r.url);
  // مكتبة supabase والخطوط: من الكاش أولا، وتحديث في الخلفية
  if(CDN.includes(u.hostname)){
    e.respondWith(caches.match(r).then(h=>{
      const n=fetch(r).then(x=>{if(x&&(x.ok||x.type==="opaque")){const k=x.clone();caches.open(C).then(c=>c.put(r,k))}return x}).catch(()=>h);
      return h||n}));
    return;
  }
  if(u.origin!==location.origin)return;
  e.respondWith(fetch(r).then(x=>{if(x.ok){const k=x.clone();caches.open(C).then(c=>c.put(r,k))}return x})
    .catch(()=>caches.match(r).then(h=>h||caches.match("index.html"))));
});

// ---- إشعارات الطلبات الجديدة (Web Push) ----
self.addEventListener("push",e=>{
  let d={};try{d=e.data?e.data.json():{}}catch(x){try{d={body:e.data.text()}}catch(y){}}
  e.waitUntil(self.registration.showNotification(d.title||"🛒 طلب جديد",{
    body:d.body||"وصل طلب جديد",icon:"icon-192.png",badge:"icon-192.png",
    tag:d.tag||("order-"+Date.now()),renotify:true,dir:"rtl",lang:"ar",vibrate:[200,100,200],
    data:{url:"./#admin"}}));
});
self.addEventListener("notificationclick",e=>{
  e.notification.close();
  e.waitUntil(clients.matchAll({type:"window",includeUncontrolled:true}).then(cs=>{
    const c=cs.find(x=>"focus" in x);
    if(c){return c.focus().then(()=>{if("navigate" in c)return c.navigate("./#admin").catch(()=>{})})}
    return clients.openWindow("./#admin");
  }));
});
