const co = require('co');
const electron = require('electron');
const express = require('express');
const isDev = require('electron-is-dev');
const path = require('path');
const plzPort = require('plz-port');

// General Error Handler
const handlError = err => {
  console.error(err);
};

// Handle any uncaught exceptions
process.on('uncaughtException', err => {
  handlError(err);
});

const { app, BrowserWindow, Menu } = electron;

// Only allow one application instance to be open at a time
const isSecondInstance = app.makeSingleInstance(() => {});
if(isSecondInstance) app.quit();

// Run the application within a generator for async flow control
co(function*() {
  try {

    const localhost = 'localhost';

    let port;

    // In development use the live ng server. In production serve the built files
    if(isDev) {
      port = 4200;
    } else {
      // Find a free port, starting with 51236
      port = yield plzPort(51236);
      yield new Promise(resolve => {
        express()
            .use(express.static(path.join(__dirname, 'dist')))
            .listen(port, () => {
              resolve();
            });
      });
    }

    const serverLocation =  `http://${localhost}:${port}`;

    app.on('ready', () => {

      const { width, height } = electron.screen.getPrimaryDisplay().workAreaSize;

      const appWindow = new BrowserWindow({
        show: false,
        width: width - 100,
        height: height - 100
      });

      appWindow.loadURL(serverLocation);

      appWindow.once('ready-to-show', () => {
        appWindow.show();
      });

      const menuTemplate = [];

      // File Menu
      menuTemplate.push({
        label: 'File',
        submenu: [
          { role: 'quit' }
        ]
      });

      // Edit Menu
      menuTemplate.push({
        label: 'Edit',
        submenu: [
          { role: 'undo' },
          { role: 'redo' },
          { type: 'separator' },
          { role: 'cut' },
          { role: 'copy' },
          { role: 'paste' },
          { role: 'selectall' }
        ]
      });

      // Window Menu
      if(isDev) {
        menuTemplate.push({
          label: 'Window',
          submenu: [
            { label: 'Show Dev Tools', role: 'toggledevtools' }
          ]
        });
      }

      const appMenu = Menu.buildFromTemplate(menuTemplate);
      Menu.setApplicationMenu(appMenu);

    });

    // Properly close the application
    app.on('window-all-closed', () => {
      app.quit();
    });

  } catch(err) {
    handlError(err);
  }
});
