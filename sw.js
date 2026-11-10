// Service worker : garde l'appli en cache pour qu'elle marche hors ligne.
// Pense à changer VERSION à chaque mise à jour, sinon les téléphones gardent l'ancienne version.
const VERSION = "rap-rat-v59";
const FILES = [
  "./", "./index.html", "./manifest.webmanifest", "./css/style.css", "./js/app.js",
  "./sons/croc.wav", "./sons/theme.mp3", "./sons/instrumental.mp3",
  "./icons/icon-192.png", "./icons/icon-512.png", "./icons/icon-maskable-512.png",
  "./icons/apple-touch-icon.png", "./icons/favicon-32.png"
];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Réseau d'abord : dès qu'une mise à jour est en ligne, on la voit au lancement suivant.
// « no-cache » évite que le cache du navigateur (10 min sur GitHub Pages) ressorte l'ancienne version.
// Sans réseau, on sert ce qui est en cache.
// Les musiques font exception (voir musique() plus bas).
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET" || !e.request.url.startsWith(self.location.origin)) return;
  if (new URL(e.request.url).pathname.endsWith(".mp3")) { e.respondWith(musique(e.request)); return; }
  e.respondWith(
    caches.open(VERSION).then(async cache => {
      try {
        const res = await fetch(e.request.url, { cache: "no-cache" });
        if (res && res.ok) cache.put(e.request, res.clone());
        return res;
      } catch (err) {
        const cached = await cache.match(e.request, { ignoreSearch: true });
        if (cached) return cached;
        throw err;
      }
    })
  );
});

// Safari lit une musique par petits bouts (en-tête « Range ») et refuse de la jouer si on
// lui renvoie le fichier entier. On garde donc le fichier complet en cache (il est rechargé
// à chaque nouvelle VERSION) et on ne rend que le bout demandé, avec le statut 206.
// Cache d'abord : inutile de retélécharger 3 Mo à chaque bout.
async function musique(req) {
  const cache = await caches.open(VERSION);
  let res = await cache.match(req.url, { ignoreSearch: true });
  if (!res) {
    res = await fetch(req.url);                       // sans « Range » : le fichier entier
    if (res.status === 200) await cache.put(req.url, res.clone());
  }
  const m = /^bytes=(\d*)-(\d*)$/.exec((req.headers.get("range") || "").trim());
  if (!m || res.status !== 200) return res;
  const buf = await res.arrayBuffer(), total = buf.byteLength;
  let debut, fin;
  if (m[1] === "") { debut = Math.max(0, total - Number(m[2] || 0)); fin = total - 1; }   // « les N derniers octets »
  else { debut = Number(m[1]); fin = m[2] === "" ? total - 1 : Math.min(Number(m[2]), total - 1); }
  if (debut >= total || debut > fin) {
    return new Response(null, { status: 416, headers: { "Content-Range": "bytes */" + total } });
  }
  return new Response(buf.slice(debut, fin + 1), {
    status: 206, statusText: "Partial Content",
    headers: {
      "Content-Type": res.headers.get("Content-Type") || "audio/mpeg",
      "Content-Range": "bytes " + debut + "-" + fin + "/" + total,
      "Content-Length": String(fin - debut + 1),
      "Accept-Ranges": "bytes"
    }
  });
}
