const electron = require('electron');
const fs = require('fs-extra-promise');
const isDev = require('electron-is-dev');
const moment = require('moment');
const path = require('path');
const SimpleStorage = require('./src-back/storage');
const ServiceNodeInterface = require('./src-back/service-node-interface');
const serve = require('electron-serve');
const { autoUpdater } = require('electron-updater');

const { app, BrowserWindow, Menu, ipcMain } = electron;

// Properly close the application
app.on('window-all-closed', () => {
  app.quit();
});

const { platform } = process;

const { name, version } = fs.readJSONSync(path.join(__dirname, 'package.json'));
ipcMain.on('getAppVersion', e => {
  e.returnValue = version;
});

let appWindow, serverLocation, sn, keyPair, storage, user, password, port, info;

// General Error Handler
const handleError = err => {
  console.error(err);
  if(appWindow) {
    appWindow.send('error', { name: err.name, message: err.message });
  }
};

// Handle any uncaught exceptions
process.on('uncaughtException', err => {
  handleError(err);
});

let loadURL;
if(!isDev) {
  loadURL = serve({directory: 'dist'});
}

require('electron-context-menu')();

// Only allow one application instance to be open at a time
const isSecondInstance = app.makeSingleInstance(() => {});
if(isSecondInstance) app.quit();

const openUpdateAvailableWindow = version => new Promise(resolve => {
  const updateAvailableWindow = new BrowserWindow({
    show: false,
    width: 550,
    height: platform === 'win32' ? 355 : 330,
    parent: appWindow
  });
  if(isDev) {
    updateAvailableWindow.loadURL(`file://${path.join(__dirname, 'src', 'update-available.html')}`);
  } else {
    updateAvailableWindow.loadURL(`file://${path.join(__dirname, 'dist', 'update-available.html')}`);
  }
  updateAvailableWindow.once('ready-to-show', () => {
    updateAvailableWindow.show();
  });
  updateAvailableWindow.on('close', () => {
    resolve();
  });
  ipcMain.on('getUpdateVersion', e => {
    e.returnValue = version;
  });
  ipcMain.on('cancel', () => {
    resolve();
    setTimeout(() => {
      updateAvailableWindow.close();
    }, 0);
  });
  ipcMain.on('accept', () => {
    autoUpdater.quitAndInstall();
  });

});

autoUpdater.on('update-downloaded', ({ version }) => {
  openUpdateAvailableWindow(version);
});
autoUpdater.on('error', err => {
  handleError(err);
});

const openConfigurationWindow = () => {

  const configurationWindow = new BrowserWindow({
    show: false,
    width: 1000,
    height: platform === 'win32' ? 575 : platform === 'darwin' ? 695 : 700,
    parent: appWindow
  });
  if(isDev) {
    configurationWindow.loadURL(`file://${path.join(__dirname, 'src', 'automation.html')}`);
  } else {
    configurationWindow.loadURL(`file://${path.join(__dirname, 'dist', 'automation.html')}`);
  }
  configurationWindow.once('ready-to-show', () => {
    configurationWindow.show();
  });

  if(isDev) {
    const menuTemplate = [];
    menuTemplate.push({
      label: 'Window',
      submenu: [
        { label: 'Show Dev Tools', role: 'toggledevtools' }
      ]
    });
    const windowMenu = Menu.buildFromTemplate(menuTemplate);
    configurationWindow.setMenu(windowMenu);
  }

  ipcMain.on('getManifest', async function() {
    try {
      const filePath = path.join(__dirname, 'data', 'manifest.json');
      const data = await fs.readJsonAsync(filePath);
      configurationWindow.send('manifest', data);
    } catch(err) {
      handleError(err);
    }
  });
  ipcMain.on('getBaseConf', function(e, walletConf) {
    try {
      const filePath = path.join(__dirname, 'data', 'wallet-confs', walletConf);
      const contents = fs.readFileSync(filePath, 'utf8');
      e.returnValue = contents;
    } catch(err) {
      handleError(err);
    }
  });
  ipcMain.on('getBridgeConf', (e, bridgeConf) => {
    try {
      const filePath = path.join(__dirname, 'data', 'xbridge-confs', bridgeConf);
      const contents = fs.readFileSync(filePath, 'utf8');
      e.returnValue = contents;
    } catch(err) {
      handleError(err);
    }
  });
  ipcMain.on('saveDXData', (e, dxUser, dxPassword, dxPort) => {
    storage.setItems({
      user: dxUser,
      password: dxPassword,
      port: dxPort
    }, true);
    e.returnValue = true;
  });
  ipcMain.on('getHomePath', e => {
    e.returnValue = app.getPath('home');
  });
  ipcMain.on('getDataPath', e => {
    e.returnValue = app.getPath('appData');
  });
  ipcMain.on('getSelected', e => {
    const selectedWallets = storage.getItem('selectedWallets') || [];
    e.returnValue = selectedWallets;
  });
  ipcMain.on('saveSelected', (e, selectedArr) => {
    storage.setItem('selectedWallets', selectedArr, true);
    e.returnValue = selectedArr;
  });

};

ipcMain.on('quit', () => {
  app.quit();
});
ipcMain.on('restart', () => {
  app.relaunch();
  app.quit();
});

const openSettingsWindow = (options = {}) => {

  let errorMessage;

  if(options.error) {
    const { error } = options;
    console.log(error);
    switch(error.status) {
      case 401:
        errorMessage = 'There was an authorization problem. Please correct your username and/or password.';
        break;
      default:
        errorMessage = 'There was a problem connecting to the Blocknet RPC server. Please check the RPC port.';
    }
    console.log(errorMessage);
  }

  ipcMain.on('getPort', e => {
    e.returnValue = storage.getItem('port') || '';
  });
  ipcMain.on('getUser', e => {
    e.returnValue = storage.getItem('user') || '';
  });
  ipcMain.on('saveData', (e, items) => {
    try {
      for(const key of Object.keys(items)) {
        const value = items[key];
        if(key === 'password' && !value && storage.getItem('password')) continue;
        storage.setItem(key, value, true);
      }
      e.sender.send('dataSaved');
    } catch(err) {
      handleError(err);
    }
  });

  const settingsWindow = new BrowserWindow({
    show: false,
    width: 500,
    height: platform === 'win32' ? 575 : platform === 'darwin' ? 560 : 535,
    parent: appWindow
  });
  if(isDev) {
    settingsWindow.loadURL(`file://${path.join(__dirname, 'src', 'settings.html')}`);
  } else {
    settingsWindow.loadURL(`file://${path.join(__dirname, 'dist', 'settings.html')}`);
  }
  settingsWindow.once('ready-to-show', () => {
    settingsWindow.show();
    if(errorMessage) {
      settingsWindow.send('errorMessage', errorMessage);
    }
  });

  if(isDev) {
    const menuTemplate = [];
    menuTemplate.push({
      label: 'Window',
      submenu: [
        { label: 'Show Dev Tools', role: 'toggledevtools' }
      ]
    });
    const windowMenu = Menu.buildFromTemplate(menuTemplate);
    settingsWindow.setMenu(windowMenu);
  }

};

const openTOSWindow = (alreadyAccepted = false) => {

  ipcMain.on('getTOS', e => {
    try {
      const text = fs.readFileSync(path.join(__dirname, 'tos.txt'), 'utf8');
      e.returnValue = text;
    } catch(err) {
      console.error(err);
    }
  });
  ipcMain.on('cancelTOS', () => {
    app.quit();
  });
  ipcMain.on('acceptTOS', () => {
    storage.setItem('tos', true, true);
    app.relaunch();
    app.quit();
  });
  ipcMain.on('alreadyAccepted', e => {
    e.returnValue = alreadyAccepted;
  });

  let height;
  if(process.platform === 'win32') {
    height = alreadyAccepted ? 660 : 735;
  } else {
    height = alreadyAccepted ? 645 : 720;
  }

  const tosWindow = new BrowserWindow({
    show: false,
    width: 500,
    height: height,
    parent: appWindow
  });
  if(isDev) {
    tosWindow.loadURL(`file://${path.join(__dirname, 'src', 'tos.html')}`);
  } else {
    tosWindow.loadURL(`file://${path.join(__dirname, 'dist', 'tos.html')}`);
  }
  tosWindow.once('ready-to-show', () => {
    tosWindow.show();
  });

  if(isDev) {
    const menuTemplate = [];
    menuTemplate.push({
      label: 'Window',
      submenu: [
        { label: 'Show Dev Tools', role: 'toggledevtools' }
      ]
    });
    const windowMenu = Menu.buildFromTemplate(menuTemplate);
    tosWindow.setMenu(windowMenu);
  }
};

const openAppWindow = () => {

  const { width, height } = electron.screen.getPrimaryDisplay().workAreaSize;

  appWindow = new BrowserWindow({
    show: false,
    width: width - 100,
    height: height - 100
  });

  const initialBounds = storage.getItem('bounds');
  if(initialBounds) {
    try {
      appWindow.setBounds(initialBounds);
    } catch(err) {
      appWindow.maximize();
    }
  } else {
    appWindow.maximize();
  }

  if(isDev) {
    appWindow.loadURL(serverLocation);
  } else {
    loadURL(appWindow);
  }

  appWindow.once('ready-to-show', () => {
    appWindow.show();
  });

  appWindow.once('show', () => {
    // version check
    const err = versionCheck(info['version']);
    if (err) {
      handleError(err);
      app.quit();
    }
  });

  appWindow.on('close', () => {
    try {
      const bounds = appWindow.getBounds();
      storage.setItem('bounds', bounds);
    } catch(err) {
      console.error(err);
    }
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

  const sendKeyPair = () => {
    appWindow.send('keyPair', keyPair);
  };
  ipcMain.on('getKeyPair', sendKeyPair);

  ipcMain.on('makeOrder', (e, data) => {
    sn.dxMakeOrder(data.maker, data.makerSize, data.makerAddress, data.taker, data.takerSize, data.takerAddress, data.type)
      .then(res => {
        if(res.id) { // success
          appWindow.send('orderDone', 'success');
          sendOrderBook();
        } else {
          appWindow.send('orderDone', 'failed');
        }
      })
      .catch(err => {
        appWindow.send('orderDone', 'server error');
        handleError(err);
      });
  });

  ipcMain.on('takeOrder', (e, data) => {
    sn.dxTakeOrder(data.id, data.sendAddress, data.receiveAddress)
      .then(res => {
        if(res.id) { // success
          appWindow.send('orderDone', 'success');
          sendOrderBook();
        } else {
          appWindow.send('orderDone', 'failed');
        }
      })
      .catch(err => {
        appWindow.send('orderDone', 'server error');
        handleError(err);
      });
  });

  const stdInterval = 4000;

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
  ipcMain.on('getOrderBook', () => sendOrderBook(true));
  setInterval(sendOrderBook, stdInterval);

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
  ipcMain.on('sendTradeHistory', () => sendTradeHistory(true));
  setInterval(sendTradeHistory, stdInterval);

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

  let myOrders = [];
  const sendMyOrders = force => {
    sn.dxGetMyOrders()
      .then(res => {
        if(force === true || JSON.stringify(res) !== JSON.stringify(myOrders)) {
          myOrders = res;
          appWindow.send('myOrders', myOrders, keyPair);
        }
      })
      .catch(handleError);
  };
  ipcMain.on('getMyOrders', () => sendMyOrders(true));
  setInterval(sendMyOrders, stdInterval);

  let orderHistory = [];
  const sendOrderHistory = force => {
    const end = moment.utc().valueOf();
    const start = moment(end).utc()
      .subtract(1, 'd')
      .valueOf();
    sn.dxGetOrderHistory(keyPair[0], keyPair[1], start, end, 60)
      .then(res => {
        if(force === true || JSON.stringify(res) !== JSON.stringify(orderHistory)) {
          orderHistory = res;
          appWindow.send('orderHistory', orderHistory);
        }
      })
      .catch(handleError);
  };
  ipcMain.on('getOrderHistory', () => sendOrderHistory(true));

  let currentPrice = {};
  const sendCurrentPrice = force => {
    const end = moment.utc().valueOf();
    const start = moment(end).utc()
      .subtract(1, 'd')
      .valueOf();
    sn.dxGetOrderHistory(keyPair[0], keyPair[1], start, end, 86400)
      .then(res => {
        if(res.length === 0) return;
        const [ data ] = res;
        if(force === true || JSON.stringify(data) !== JSON.stringify(currentPrice)) {
          currentPrice = data;
          appWindow.send('currentPrice', data);
        }
      })
      .catch(handleError);
  };
  ipcMain.on('getCurrentPrice', () => sendCurrentPrice(true));
  setInterval(sendCurrentPrice, stdInterval);

  // TODO This is too aggressive to be called as frequently as it is...
  const sendCurrencies = async function() {
    try {
      const [ localTokens, networkTokens ] = await Promise.all([
        sn.dxGetLocalTokens(),
        sn.dxGetNetworkTokens()
      ]);
      const localTokensSet = new Set(localTokens);
      const comparator = networkTokens.includes('BTC') ? 'BTC' : networkTokens.includes('LTC') ? 'LTC' : networkTokens[0];
      const currencies = [];
      const end = moment.utc().valueOf();
      const start = moment(end).utc()
        .subtract(1, 'd')
        .valueOf();

      for(const token of networkTokens) {
        const second = token === comparator ? networkTokens.find(t => t !== comparator) : comparator;
        const res = await sn.dxGetOrderHistory(token, second, start, end, 86400);
        if(res.length === 0) {
          currencies.push({
            symbol: token,
            name: token,
            last: 0,
            volume: 0,
            change: 0,
            local: localTokensSet.has(token)
          });
        } else {
          const obj = res[0];
          currencies.push(Object.assign({}, obj, {
            symbol: token,
            name: token,
            last: obj.close,
            change: (obj.close / obj.open) - 1,
            local: localTokensSet.has(token)
          }));
        }
      }
      appWindow.send('currencies', currencies);
    } catch(err) {
      handleError(err);
    }
  };
  ipcMain.on('getCurrencies', sendCurrencies);

  const sendCurrencyComparisons = async function(primary) {
    try {
      const [ localTokens, networkTokens ] = await Promise.all([
        sn.dxGetLocalTokens(),
        sn.dxGetNetworkTokens()
      ]);
      const localTokensSet = new Set(localTokens);
      const currencies = [];
      const end = moment.utc().valueOf();
      const start = moment(end).utc()
        .subtract(1, 'd')
        .valueOf();

      for(const second of networkTokens) {
        if(second === primary) continue;
        const res = await sn.dxGetOrderHistory(primary, second, start, end, 86400);
        if(res.length === 0) {
          currencies.push({
            symbol: second,
            name: second,
            last: 0,
            volume: 0,
            change: 0,
            local: localTokensSet.has(primary) && localTokensSet.has(second)
          });
        } else {
          const obj = res[0];
          currencies.push(Object.assign({}, obj, {
            symbol: second,
            name: second,
            last: obj.close,
            change: (obj.close / obj.open) - 1,
            local: localTokensSet.has(primary) && localTokensSet.has(second)
          }));
        }
      }
      appWindow.send('currencyComparisons', currencies);
    } catch(err) {
      handleError(err);
    }
  };
  ipcMain.on('getCurrencyComparisons', (e, primary) => sendCurrencyComparisons(primary));

  ipcMain.on('saveAddress', (e, key, address) => {
    try {
      const addresses = storage.getItem('addresses');
      storage.setItem('addresses', Object.assign({}, addresses, {
        [key]: address
      }));
    } catch(err) {
      handleError(err);
    }
  });

  ipcMain.on('getAddressesSync', e => {
    const addresses = storage.getItem('addresses');
    e.returnValue = addresses;
  });

  ipcMain.on('cancelOrder', (e, id) => {
    sn.dxCancelOrder(id)
      .then(res => {
        appWindow.send('orderCancelled', res.id);
        setTimeout(() => {
          sendMyOrders(true);
        }, 1000);
      })
      .catch(handleError);
  });

  let balances = [];
  const sendBalances = force  => {
    sn.dxGetTokenBalances()
      .then(data => {
        if(force === true || JSON.stringify(data) !== JSON.stringify(balances)) {
          balances = data;
          appWindow.send('balances', balances);
        }
      })
      .catch(handleError);
  };
  ipcMain.on('getBalances', () => sendBalances(true));
  setInterval(sendBalances, stdInterval);

  ipcMain.on('setKeyPair', (e, pair) => {
    storage.setItem('keyPair', pair);
    keyPair = pair;
    sendKeyPair();
    sendOrderBook(true);
    sendTradeHistory(true);
    sendMyOrders(true);
    sendOrderHistory(true);
    sendCurrentPrice(true);
  });

  ipcMain.on('isFirstRun', e => {
    const isFirstRun = storage.getItem('isFirstRun');
    if(isFirstRun !== false) {
      storage.setItem('isFirstRun', false);
      e.returnValue = true;
    } else {
      e.returnValue = false;
    }
  });

  ipcMain.on('openSettings', () => {
    openSettingsWindow();
  });

  ipcMain.on('openConfigurationWizard', () => {
    openConfigurationWindow();
  });

  ipcMain.on('openTOS', () => {
    openTOSWindow(true);
  });

};

const onReady = new Promise(resolve => app.on('ready', resolve));

// Run the application within async function for flow control
(async function() {
  try {
    let dataPath;
    if(process.platform === 'win32') {
      dataPath = path.join(process.env.LOCALAPPDATA, name);
      fs.ensureDirSync(dataPath);
    } else {
      dataPath = app.getPath('userData');
    }

    const fileExists = p => {
      try {
        fs.statSync(p);
        return true;
      } catch(err) {
        return false;
      }
    };

    const previousMetaPath = path.join(dataPath, 'meta.json');
    const metaPath = path.join(dataPath, 'app-meta.json');

    if(!fileExists(metaPath) && fileExists(previousMetaPath)) {
      fs.moveSync(previousMetaPath, metaPath);
    }

    storage = new SimpleStorage(metaPath);
    user = storage.getItem('user');
    password = storage.getItem('password');
    port = storage.getItem('port');

    if(!storage.getItem('addresses')) {
      storage.setItem('addresses', {});
    }

    if(!storage.getItem('tos')) {
      await onReady;
      openTOSWindow();
      if(!isDev) autoUpdater.checkForUpdates();
      return;
    }

    if(!port) {
      port = '41414';
      storage.setItem('port', port);
    }

    if(!user || !password) {
      await onReady;
      openConfigurationWindow();
      // openSettingsWindow();
      if(!isDev) autoUpdater.checkForUpdates();
      return;
    }

    sn = new ServiceNodeInterface(user, password, `http://${platform === 'linux' ? '127.0.0.1' : 'localhost'}:${port}`);

    await new Promise(resolve => setTimeout(resolve, 2000));

    try {
      info = await sn.getinfo();
    } catch(err) {
      // console.error(err);
      await onReady;
      // openSettingsWindow({ error: err });
      openConfigurationWindow();
      return;
    }

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

    // In development use the live ng server. In production serve the built files
    if(isDev) {
      serverLocation =  `http://${localhost}:4200`;
    }

    await onReady;

    if(!isDev) autoUpdater.checkForUpdates();

    openAppWindow();

  } catch(err) {
    handleError(err);
  }

})();

// check for version number. Minimum supported blocknet client version
function versionCheck(version) {
  if (version < 3090400) {
    return {name: 'Unsupported Version', message: 'BLOCK DX requires Blocknet wallet version 3.9.04 or greater.'};
  }
  return null;
}
