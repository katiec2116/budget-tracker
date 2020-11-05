// Caching everything in the public folder
const FILES_TO_CACHE = [
    "/",
    "/icons/icon-192x192.png",
    "/icons/icon-512x512.png",
    "/index.html",
    "index.js",
    "/db.js",
    "manifest.json",
    "/styles.css",
  ];
  
  const CACHE_NAME = "static-cache-v2";
  const DATA_CACHE_NAME = "data-cache-v1";
  
  //if ("service worker" in navigator)
  
  // Install
  self.addEventListener("install", function (evt) {
    evt.waitUntil(
      caches.open(CACHE_NAME).then((cache) => {
        console.log("Your files were pre-cached successfully!");
        return cache.addAll(FILES_TO_CACHE);
      })
    );
  
    self.skipWaiting();
  });
  
  // Activate
  self.addEventListener("activate", function (evt) {
    evt.waitUntil(
      caches.keys().then((keyList) => {
        return Promise.all(
          keyList.map((key) => {
            if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
              console.log("Removing old cache data", key);
              return caches.delete(key);
            }
          })
        );
      })
    );
  
    self.clients.claim();
  });
  
  // Fetch
  self.addEventListener("fetch", (evt) => {
    if (evt.request.url.includes("/api/")) {
      console.log("[Service Worker] Fetch(data)", evt.request.url);
  
      evt.respondWith(
        caches.open(DATA_CACHE_NAME).then((cache) => {
          return fetch(evt.request)
            .then((response) => {
              if (response.status === 200) {
                cache.put(evt.request.url, response.clone());
              }
              return response;
            })
            .catch((err) => {
              return cache.match(evt.request);
            });
        })
      );
      return;
    }
  
    evt.respondWith(
      fetch(evt.request).catch(function () {
        return caches.match(evt.request).then(function (response) {
          if (response) {
            return response;
          } else if (evt.request.headers.get("accept").includes("text/html")) {
            // Return the cached homepage for all requests for html pages
            return caches.match("/");
          }
        });
      })
    );
  });