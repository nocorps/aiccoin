// Add this code at the top before imports
if (window.location.hostname === 'aiccoin.nocorps.org') {
  const currentUrl = new URL(window.location.href);
  const searchParams = currentUrl.searchParams;
  const ref = searchParams.get('ref'); // Get referral code if exists
  
  // Construct new URL with referral code if present
  let redirectUrl = 'https://aiccoin.site';
  if (ref) {
    redirectUrl += `?ref=${ref}`;
  }
  
  // Add any other path components from original URL
  if (currentUrl.pathname !== '/') {
    redirectUrl += currentUrl.pathname;
  }

  window.location.href = redirectUrl;
}

import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import './assets/disble.css';

createApp(App)
  .use(router)
  .mount('#app');

// Disable right-click
document.addEventListener('contextmenu', (e) => {
  e.preventDefault();
});

// Disable F12, Ctrl+Shift+I, and other DevTools shortcuts
document.addEventListener('keydown', (e) => {
  if (
    e.key === 'F12' || // F12 key
    (e.ctrlKey && e.shiftKey && e.key === 'I') || // Ctrl + Shift + I
    (e.ctrlKey && e.shiftKey && e.key === 'J') || // Ctrl + Shift + J
    (e.ctrlKey && e.key === 'U') // Ctrl + U (View Source)
  ) {
    e.preventDefault();
    // alert('Inspect element is disabled.');
  }
});

// Prevent drag and drop (optional)
document.addEventListener('dragstart', (e) => {
  e.preventDefault();
});

// Optional: Block user from opening developer tools via DevTools APIs
setInterval(() => {
  const devToolsOpened = /./;
  devToolsOpened.toString = function () {
    // alert('Inspect element is disabled.');
  };
}, 1000);

const meta = document.createElement('meta');
meta.name = 'viewport';
meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
document.getElementsByTagName('head')[0].appendChild(meta);

// Block pinch-zoom gestures
document.addEventListener('gesturestart', (e) => {
  e.preventDefault();
});
document.addEventListener('gesturechange', (e) => {
  e.preventDefault();
});
document.addEventListener('gestureend', (e) => {
  e.preventDefault();
});

// Prevent text selection
document.addEventListener('selectstart', (e) => {
  e.preventDefault();
});

