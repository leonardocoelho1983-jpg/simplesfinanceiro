// service-worker.js - Service Worker com estratégia de cache otimizada para PWA

const CACHE_VERSION = 'v2';
const CACHE_NAME = `controle-financeiro-${CACHE_VERSION}`;
const RUNTIME_CACHE = `controle-financeiro-runtime-${CACHE_VERSION}`;

const urlsToCache = [
    './',
    './index.html',
    './style.css',
    './app.js',
    './manifest.json',
    './icons/icon-192x192.png',
    './icons/icon-512x512.png',
    'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css',
    'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js'
];

// Instalação do Service Worker e cache dos arquivos estáticos
self.addEventListener('install', event => {
    console.log('Service Worker: Instalando...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Service Worker: Cache aberto');
                return cache.addAll(urlsToCache)
                    .catch(err => {
                        console.warn('Service Worker: Alguns arquivos não puderam ser cacheados', err);
                        // Continua mesmo que alguns arquivos falhem
                        return Promise.resolve();
                    });
            })
            .then(() => self.skipWaiting()) // Ativa imediatamente
    );
});

// Intercepta requisições e serve do cache, se disponível
self.addEventListener('fetch', event => {
    const { request } = event;
    const url = new URL(request.url);

    // Ignora requisições não-GET
    if (request.method !== 'GET') {
        return;
    }

    // Estratégia Cache First para arquivos estáticos
    if (isStaticAsset(url)) {
        event.respondWith(
            caches.match(request)
                .then(response => {
                    if (response) {
                        return response;
                    }
                    return fetch(request)
                        .then(response => {
                            // Não cacheia respostas inválidas
                            if (!response || response.status !== 200 || response.type === 'error') {
                                return response;
                            }

                            const responseToCache = response.clone();
                            caches.open(CACHE_NAME)
                                .then(cache => {
                                    cache.put(request, responseToCache);
                                });

                            return response;
                        })
                        .catch(() => {
                            // Retorna um fallback offline se disponível
                            return caches.match('./index.html');
                        });
                })
        );
    } else {
        // Estratégia Network First para outros recursos
        event.respondWith(
            fetch(request)
                .then(response => {
                    if (!response || response.status !== 200) {
                        return response;
                    }

                    const responseToCache = response.clone();
                    caches.open(RUNTIME_CACHE)
                        .then(cache => {
                            cache.put(request, responseToCache);
                        });

                    return response;
                })
                .catch(() => {
                    // Tenta cache se rede falhar
                    return caches.match(request)
                        .then(response => {
                            return response || caches.match('./index.html');
                        });
                })
        );
    }
});

// Ativação do Service Worker e limpeza de caches antigos
self.addEventListener('activate', event => {
    console.log('Service Worker: Ativando...');
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    // Deleta caches antigos
                    if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
                        console.log('Service Worker: Deletando cache antigo:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim()) // Toma controle imediatamente
    );
});

// Função auxiliar para determinar se é um ativo estático
function isStaticAsset(url) {
    const staticExtensions = ['.js', '.css', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.woff', '.woff2', '.ttf', '.eot'];
    const pathname = url.pathname;
    return staticExtensions.some(ext => pathname.endsWith(ext)) || 
           url.hostname === 'cdn.jsdelivr.net';
}

// Sincronização em background (futuro)
self.addEventListener('sync', event => {
    if (event.tag === 'sync-data') {
        event.waitUntil(
            // Aqui você pode sincronizar dados quando a conexão voltar
            Promise.resolve()
        );
    }
});

// Notificações push (futuro)
self.addEventListener('push', event => {
    if (event.data) {
        const options = {
            body: event.data.text(),
            icon: './icons/icon-192x192.png',
            badge: './icons/icon-96x96.png',
            tag: 'notification',
            requireInteraction: false
        };
        event.waitUntil(
            self.registration.showNotification('Controle Financeiro', options)
        );
    }
});

// Clique em notificação
self.addEventListener('notificationclick', event => {
    event.notification.close();
    event.waitUntil(
        clients.matchAll({ type: 'window' }).then(clientList => {
            for (let client of clientList) {
                if (client.url === './' && 'focus' in client) {
                    return client.focus();
                }
            }
            if (clients.openWindow) {
                return clients.openWindow('./');
            }
        })
    );
});
