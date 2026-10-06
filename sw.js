"use strict";

const CACHE_NAME = "thefacebook-app-v4";
const APP_SHELL = [
  "./",
  "./index.html",
  "./app.js",
  "./storage.js",
  "./manifest.json",
  "./rss.xml",
  "./assets/icons/icon-512.png"
];

self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function (cache) {
        return cache.addAll(APP_SHELL);
      })
      .then(function () {
        return self.skipWaiting();
      })
  );
});

self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys()
      .then(function (names) {
        return Promise.all(
          names.map(function (name) {
            if (name !== CACHE_NAME && name.indexOf("thefacebook-app-") === 0) {
              return caches.delete(name);
            }
            return undefined;
          })
        );
      })
      .then(function () {
        return self.clients.claim();
      })
  );
});

self.addEventListener("fetch", function (event) {
  const request = event.request;

  if (request.method !== "GET") {
    return;
  }

  const url = new URL(request.url);

  if (url.origin !== self.location.origin) {
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request, { cache: "no-store" })
        .then(function (response) {
          if (response && response.ok) {
            caches.open(CACHE_NAME).then(function (cache) {
              cache.put("./index.html", response.clone());
            });
          }
          return response;
        })
        .catch(function () {
          return caches.match("./index.html").then(function (response) {
            if (response) {
              return response;
            }
            return new Response("Offline", {
              status: 503,
              headers: { "Content-Type": "text/plain; charset=utf-8" }
            });
          });
        })
    );
    return;
  }

  event.respondWith(
    caches.match(request).then(function (cached) {
      if (cached) {
        return cached;
      }

      return fetch(request).then(function (response) {
        if (response && response.ok) {
          caches.open(CACHE_NAME).then(function (cache) {
            cache.put(request, response.clone());
          });
        }
        return response;
      });
    })
  );
});
