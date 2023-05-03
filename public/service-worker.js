// public/service-worker.js

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('my-pwa-cache').then((cache) => {
      return cache.addAll([
        '/',
        '/index.html',
        '/vite.svg',
        '/node_modules/bootstrap/dist/css/bootstrap.css',
        '/src',
        '/src/main.tsx',
        '/src/App.tsx',
        '/src/App.css',
        '/src/index.css',
        '/src/service-worker.ts',
        '/src/Components/Recipes/Recipes.tsx',
        '/src/Components/Recipes/RecipeStyles.css',
        '/src/Components/RecipeCard/Card.tsx',
        '/src/Components/RecipeCard/CardStyles.css',
        '/@vite/client',
        '/@react-refresh',
        '/@id/__x00__react/jsx-dev-runtime',
        '/node_modules/vite/dist/client/env.mjs',
        // Add any other static assets (CSS, images, etc.) you want to cache
      ]);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
