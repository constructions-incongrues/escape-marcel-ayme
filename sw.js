/*
 * grrd's Puzzle
 * Copyright (c) 2012 Gerard Tyedmers, grrd@gmx.net
 * Licensed under the MPL License
 */

/*jslint devel: true, browser: true */ /*global  self  */

var CACHE_NAME = "grrds-puzzle-cache";
var CACHE_VERSION = "v2.10";
var CACHE = CACHE_NAME + "-" + CACHE_VERSION;

var urlsToCache = [
    "Images/4inarow.svg",
    "Images/animals/theme.png",
    "Images/bullets0.svg",
    "Images/bullets0o.svg",
    "Images/bullets1.svg",
    "Images/bullets1o.svg",
    "Images/dice.svg",
    "Images/down.svg",
    "Images/dummy.png",
    "Images/easy_gold.svg",
    "Images/easy.svg",
    "Images/escfullscreen.svg",
    "Images/favicon_dark.ico",
    "Images/favicon.ico",
    "Images/fullscreen.svg",
    "Images/hard_gold.svg",
    "Images/hard.svg",
    "Images/info.svg",
    "Images/loading.svg",
    "Images/lock.svg",
    "Images/mail.svg",
    "Images/medal1.svg",
    "Images/medal2.svg",
    "Images/medal3.svg",
    "Images/medium_gold.svg",
    "Images/medium.svg",
    "Images/memo.svg",
    "Images/next.svg",
    "Images/ok.svg",
    "Images/photo.svg",
    "Images/piece_gold.svg",
    "Images/prev.svg",
    "Images/puzzle.svg",
    "Images/settings.svg",
    "Images/tictactoe.svg",
    "Images/title_wide.png",
    "Images/title1.png",
    "Images/ui/recompense.jpg",
    "Images/x.svg",
    "Locales/ar/puzzle.properties",
    "Locales/bn/puzzle.properties",
    "Locales/cs/puzzle.properties",
    "Locales/de/puzzle.properties",
    "Locales/en/puzzle.properties",
    "Locales/es/puzzle.properties",
    "Locales/fr/puzzle.properties",
    "Locales/hr/puzzle.properties",
    "Locales/hu/puzzle.properties",
    "Locales/it/puzzle.properties",
    "Locales/locales.ini",
    "Locales/nl/puzzle.properties",
    "Locales/pl/puzzle.properties",
    "Locales/pt_BR/puzzle.properties",
    "Locales/pt_PT/puzzle.properties",
    "Locales/rm/puzzle.properties",
    "Locales/ru/puzzle.properties",
    "Locales/sl/puzzle.properties",
    "Locales/sr/puzzle.properties",
    "Locales/ta/puzzle.properties",
    "Locales/tr/puzzle.properties",
    "Locales/ur/puzzle.properties",
    "Locales/zh_CN/puzzle.properties",
    "Locales/zh/puzzle.properties",
    "puzzle.html",
    "Scripts/debug.js",
    "Scripts/exif.js",
    "Scripts/kinetic-v4.7.4.min.js",
    "Scripts/l10n.js",
    "Scripts/puzzle.css",
    "Scripts/puzzle.js",
    "Scripts/swipe.css",
    "Scripts/swipe.js",
    "Sounds/click.mp3",
    "Sounds/labo.mp3"
];

// self.addEventListener("install", function (event) {
//     // Perform install steps
//     event.waitUntil(
//         caches.open(CACHE)
//             .then(function (cache) {
//                 return cache.addAll(urlsToCache);
//             })
//     );
// });

self.addEventListener("install", (event) => {
    event.waitUntil(
        (async() => {
            try {
                cache_obj = await caches.open(CACHE)
                cache_obj.addAll(urlsToCache)
            }
            catch (error) {
                console.log('Error caching')
                console.log(error)
            }
        })()
    )
} )

self.addEventListener("fetch", function (event) {
    event.respondWith(
        caches.match(event.request)
            .then(function (response) {
                if (response) {
                    return response;
                }

                var fetchRequest = event.request.clone();
                
                return fetch(fetchRequest).then(
                    function (response) {
                        // Check if we received a valid response
                        if (!response || response.status !== 200 || response.type !== "basic") {
                            console.log(response);
                            return response;
                        }

                        var responseToCache = response.clone();

                        caches.open(CACHE)
                            .then(function (cache) {
                                cache.put(event.request, responseToCache);
                            });

                        return response;
                    }
                );
            })
    );
});

self.addEventListener("activate", function (event) {
    event.waitUntil(
        caches.keys().then(function (cacheNames) {
            return Promise.all(cacheNames.map(function (cacheName) {
                if (cacheName.indexOf(CACHE_NAME) === 0 && cacheName.indexOf(CACHE_VERSION) === -1) {
                    console.log(cacheName + " deleted");
                    return caches.delete(cacheName);
                }
            }));
        })
    );
});
