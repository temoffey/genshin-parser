const { ipcRenderer } = require('electron');

window.addEventListener('DOMContentLoaded', function() {
  let button = document.querySelector('[data-click]');
  if (button) button.addEventListener('click', click);
});

function click() {
  if (!this.disabled && this.dataset.click) {
    this.disabled = true;
    ipcRenderer.send('click', this.dataset.click);
  }
}

ipcRenderer.on('end', (event, command) => {
  let button = document.querySelector('[data-click="' + command + '"]');
  if (button) button.disabled = false;
});

ipcRenderer.on('error', (event, error) => {
  alert(error);
});