const { app, BrowserWindow, ipcMain } = require('electron');

function openWindow(title) {
  app.whenReady().then(() => {
    const win = new BrowserWindow({
      width: 512,
      height: 256,
      resizable: false,
      autoHideMenuBar: true,
      title: title,
      icon: './assets/icon.ico',
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
      },
    });

    win.loadFile('./assets/index.html');
    // win.webContents.openDevTools();
  });

  app.on('window-all-closed', function() {
    app.quit();
  });
}

function addHandlers(handlers) {
  ipcMain.on('click', (event, command) => {
    if (typeof handlers[command] != 'function')
      return event.reply('error', new Error('Команда "' + command + '" не найдена'));

    handlers[command]().catch((error) => {
      console.error(error);
      event.reply('error', error);
    }).finally(() => {
      event.reply('end', command);
    });
  });
}

module.exports.openWindow = openWindow;
module.exports.addHandlers = addHandlers;
