// import './assets/main.css'

// import { createApp } from 'vue'
// import App from './App.vue'

// createApp(App).mount('#app')


// import { createApp } from 'vue';
// import App from './App.vue';
// import router from './router';

// createApp(App)
//   .use(router)
//   .mount('#app');



// src/main.js
import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
// import './assets/disble.css';

createApp(App)
  .use(router)
  .mount('#app');

// Disable right-click
// document.addEventListener('contextmenu', (e) => {
//   e.preventDefault();
// });

// Disable F12, Ctrl+Shift+I, and other DevTools shortcuts
// document.addEventListener('keydown', (e) => {
//   if (
//     e.key === 'F12' || // F12 key
//     (e.ctrlKey && e.shiftKey && e.key === 'I') || // Ctrl + Shift + I
//     (e.ctrlKey && e.shiftKey && e.key === 'J') || // Ctrl + Shift + J
//     (e.ctrlKey && e.key === 'U') // Ctrl + U (View Source)
//   ) {
//     e.preventDefault();
//     // alert('Inspect element is disabled.');
//   }
// });

// Prevent drag and drop (optional)
// document.addEventListener('dragstart', (e) => {
//   e.preventDefault();
// });

// Optional: Block user from opening developer tools via DevTools APIs
// setInterval(() => {
//   const devToolsOpened = /./;
//   devToolsOpened.toString = function () {
//     // alert('Inspect element is disabled.');
//   };
// }, 1000);

