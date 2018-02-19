const electron = require('electron');
const express = require('express');
const fs = require('fs-extra-promise');
const isDev = require('electron-is-dev');
const moment = require('moment');
const path = require('path');
const plzPort = require('plz-port');
const SimpleStorage = require('./src-back/storage');
const ServiceNodeInterface = require('./src-back/service-node-interface');

// General Error Handler
const handleError = err => {
  console.error(err);
};

// Handle any uncaught exceptions
process.on('uncaughtException', err => {
  handleError(err);
});

const { app, BrowserWindow, Menu, ipcMain } = electron;

// Only allow one application instance to be open at a time
const isSecondInstance = app.makeSingleInstance(() => {});
if(isSecondInstance) app.quit();

let serverLocation, sn, keyPair;

const ready = () => {

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

  let orderBook = {
    maker: '',
    taker: '',
    bids: [],
    asks: []
  };

  const sendOrderBook = force => {
    sn.dxGetOrderBook3(keyPair[0], keyPair[1])
      .then(res => {
        if(force === true || JSON.stringify(res) !== JSON.stringify(orderBook)) {
          orderBook = res;
          appWindow.send('orderBook', orderBook);
        }
      })
      .catch(handleError);
  };

  setInterval(sendOrderBook, 4000);

  ipcMain.on('getOrderBook', () => sendOrderBook(true));

  let tradeHistory = [];

  const sendTradeHistory = force => {
    sn.dxGetOrderFills(keyPair[0], keyPair[1])
      .then(res => {
        if(force === true || JSON.stringify(res) !== JSON.stringify(tradeHistory)) {
          tradeHistory = res;
          appWindow.send('tradeHistory', tradeHistory, keyPair);
        }
      })
      .catch(handleError);
  };

  setInterval(sendTradeHistory, 4000);
  ipcMain.on('sendTradeHistory', () => sendTradeHistory(true));

  const sendLocalTokens = () => {
    sn.dxGetLocalTokens()
      .then(res => appWindow.send('localTokens', res))
      .catch(handleError);
  };
  ipcMain.on('getLocalTokens', sendLocalTokens);

  const sendNetworkTokens = () => {
    sn.dxGetNetworkTokens()
      .then(res => appWindow.send('networkTokens', res))
      .catch(handleError);
  };
  ipcMain.on('getNetworkTokens', sendNetworkTokens);

  const sendMyOrders = () => {
    sn.dxGetMyOrders()
      .then(res => appWindow.send('myOrders', res))
      .catch(handleError);
  };
  ipcMain.on('getMyOrders', sendMyOrders);

  const sendOrderHistory = () => {
    const begin = moment().subtract(1, 'days').toDate();
    const end = moment().toDate();
    sn.dxGetOrderHistory(keyPair[0], keyPair[1], begin.getTime(), end.getTime(), 30)
      .then(res => appWindow.send('orderHistory', res))
      .catch(handleError);
  };
  ipcMain.on('getOrderHistory', sendOrderHistory);

  const sendKeyPair = () => {
    appWindow.send('keyPair', keyPair);
  };

  ipcMain.on('getKeyPair', () => sendKeyPair());
  ipcMain.on('setKeyPair', (e, pair) => {
    keyPair = pair;
    sendKeyPair();
    sendOrderBook();
    sendTradeHistory();
  });

};

const onReady = new Promise(resolve => app.on('ready', resolve));

// Run the application within async function for flow control
(async function() {
  try {
    const { name } = fs.readJSONSync(path.join(__dirname, 'package.json'));
    let dataPath;
    if(process.platform === 'win32') {
      dataPath = path.join(process.env.LOCALAPPDATA, name);
      fs.ensureDirSync(dataPath);
    } else {
      dataPath = app.getPath('userData');
    }

    const storage = new SimpleStorage(path.join(dataPath, 'meta.json'));
    let user = storage.getItem('user');
    let password = storage.getItem('password');

    if(!user) {
      user = 'myuser';
      storage.setItem('user', user);
    }
    if(!password) {
      password = 'mypassword';
      storage.setItem('password', password);
    }

    sn = new ServiceNodeInterface(user, password, 'http://localhost:41414');

    await new Promise(resolve => setTimeout(resolve, 2000));

    keyPair = storage.getItem('keyPair');
    if(!keyPair) {
      const tokens = await sn.dxGetLocalTokens();
      if(tokens.length < 2) {
        const dif = 2 - tokens.length;
        const networkTokens = await sn.dxGetNetworkTokens();
        for(let i = 0; i < dif; i++) {
          const newToken = networkTokens.find(t => !tokens.includes(t));
          tokens.push(newToken);
        }
      }
      keyPair = tokens.slice(0, 2);
      storage.setItem('keyPair', keyPair);
    }

    const localhost = 'localhost';

    let port;

    // In development use the live ng server. In production serve the built files
    if(isDev) {
      port = 4200;
    } else {
      // Find a free port, starting with 51236
      port = await plzPort(51236);
      await new Promise(resolve => {
        express()
          .use(express.static(path.join(__dirname, 'dist')))
          .listen(port, () => {
            resolve();
          });
      });
    }

    serverLocation =  `http://${localhost}:${port}`;

    await onReady;

    ready();

  } catch(err) {
    handleError(err);
  }

})();

// Properly close the application
app.on('window-all-closed', () => {
  app.quit();
});
