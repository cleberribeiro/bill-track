// Service worker pass-through — exists só pra Chrome considerar o app instalável.
// Não cacheia nada: cada requisição vai direto pra rede.
// Quando você deployar mudança, o app já pega a versão nova no próximo open.

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', () => {
  // Sem `event.respondWith` — browser usa rede normalmente.
});
