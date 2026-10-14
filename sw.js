const C='salyn-pos-v1';
const SHELL=['./','index.html','manifest.json','icon-192.png','icon-512.png'];
self.addEventListener('install',e=>{
  e.waitUntil(caches.open(C).then(c=>Promise.all(SHELL.map(u=>c.add(u).catch(()=>{})))).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',e=>{
  const r=e.request;
  if(r.method!=='GET')return;
  const u=new URL(r.url);
  // Archivos de la app: primero internet (para ver siempre la última versión), si no hay, lo guardado
  if(u.origin===location.origin){
    e.respondWith(
      fetch(r).then(res=>{
        if(res.ok){const cp=res.clone();caches.open(C).then(c=>c.put(r,cp))}
        return res;
      }).catch(()=>caches.match(r).then(m=>m||caches.match('index.html')))
    );
    return;
  }
  // Librerías de Firebase: se guardan para poder abrir la app sin internet
  if(u.hostname==='www.gstatic.com'&&u.pathname.startsWith('/firebasejs/')){
    e.respondWith(caches.match(r).then(m=>m||fetch(r).then(res=>{
      if(res.ok){const cp=res.clone();caches.open(C).then(c=>c.put(r,cp))}
      return res;
    })));
  }
});
