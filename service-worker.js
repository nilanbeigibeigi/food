const CACHE_NAME = "persia-foods-cache-v1";

const urlsToCache = [
  "/food/",
  "/food/index.html",
  "/food/login.html",
  "/food/shop.html",
  "/food/branches.html",
  "/food/events.html",
  "/food/account-customer.html",
  "/food/account-staff.html",
  "/food/account-manager.html"
];

// install
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

// fetch
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
