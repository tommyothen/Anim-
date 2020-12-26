// It has the same sandbox as a Chrome extension.
// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process because
// `nodeIntegration` is turned off. Use `preload.js` to
// selectively enable features needed in the rendering
// process.

// It has the same sandbox as a Chrome extension.
setInterval(() => {
  if (window.location.href.includes("https://animixplay.to/v1")) {}
}, 1e2);

