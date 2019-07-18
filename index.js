const electron = require('electron');
const fs = require('fs-extra-promise');
const isDev = require('electron-is-dev');
const moment = require('moment');
const path = require('path');
const SimpleStorage = require('./src-back/storage');
const ServiceNodeInterface = require('./src-back/service-node-interface');
const serve = require('electron-serve');
const { autoUpdater } = require('electron-updater');
const PricingInterface = require('./src-back/pricing-interface');
const ConfController = require('./src-back/conf-controller');
const _ = require('lodash');

const { app, BrowserWindow, Menu, ipcMain } = electron;

autoUpdater.autoDownload = false;
autoUpdater.autoInstallOnAppQuit = true;

// Properly close the application
app.on('window-all-closed', () => {
  app.quit();
});

const { platform } = process;

const { name, version } = fs.readJSONSync(path.join(__dirname, 'package.json'));
ipcMain.on('getAppName', e => {
  e.returnValue = name;
});
ipcMain.on('getAppVersion', e => {
  e.returnValue = version;
});

let appWindow, serverLocation, sn, keyPair, storage, user, password, port, info, pricingSource, pricingUnit, apiKeys,
  pricingFrequency, enablePricing, sendPricingMultipliers, clearPricingInterval, setPricingInterval,
  sendMarketPricingEnabled, metaPath, availableUpdate, tradeHistory, myOrders;
let updateError = false;

// Handle explicit quit
ipcMain.on('quitResetFirstRun', () => {
  if (storage)
    storage.setItem('isFirstRun', true);
  app.quit();
});

const configurationFilesDirectory = path.join(__dirname, 'blockchain-configuration-files');

const getManifest = () => {
  let manifest = storage.getItem('manifest');
  if(!manifest) {
    const filePath = path.join(configurationFilesDirectory, 'manifest-latest.json');
    manifest = fs.readJsonSync(filePath);
  }
  return manifest;
};

const setAppMenu = () => {

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

};

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
process.on('unhandledRejection', err => {
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

const openOrderDetailsWindow = details => {

  let height;
  if(process.platform === 'win32') {
    height = isDev ? 680 : 662;
  } else if(process.platform === 'darwin') {
    height = 645;
  } else { // Linux
    height = 645;
  }

  const detailsWindow = new BrowserWindow({
    show: false,
    width: 800,
    height,
    parent: appWindow
  });
  if(isDev) {
    detailsWindow.loadURL(`file://${path.join(__dirname, 'src', 'order-details.html')}`);
  } else {
    detailsWindow.loadURL(`file://${path.join(__dirname, 'dist', 'order-details.html')}`);
  }
  detailsWindow.once('ready-to-show', () => {
    detailsWindow.show();
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
    detailsWindow.setMenu(windowMenu);
  } else if(platform === 'win32') {
    detailsWindow.setMenu(null);
  }

  ipcMain.once('getOrderDetails', async function(e) {
    e.returnValue = details;
  });

};

const formatDate = isoStr => moment(isoStr).format('HH:mm:ss MMM D, YYYY');

ipcMain.on('openOrderDetailsWindow', async function(e, orderId) {
  const order = await sn.dxGetOrder(orderId);
  openOrderDetailsWindow([
    ['ID', order.id],
    ['Maker', order.maker],
    ['Maker Size', order.makerSize],
    ['Taker', order.taker],
    ['Taker Size', order.takerSize],
    ['Updated At', formatDate(order.updatedAt)],
    ['Created At', formatDate(order.createdAt)],
    ['Status', order.status]
  ]);
});
ipcMain.on('openMyOrderDetailsWindow', async function(e, orderId) {
  const order = myOrders.find(o => o.id === orderId) || {};
  const details = [
    ['ID', order.id],
    ['Maker', order.maker],
    ['Maker Size', order.makerSize],
    ['Maker Address', order.makerAddress],
    ['Taker', order.taker],
    ['Taker Size', order.takerSize],
    ['Taker Address', order.takerAddress],
    ['Updated At', formatDate(order.updatedAt)],
    ['Created At', formatDate(order.createdAt)],
    ['Status', order.status]
  ];
  openOrderDetailsWindow(details);
});
ipcMain.on('openOrderHistoryDetailsWindow', async function(e, orderId) {
  const order = tradeHistory.find(o => o.id === orderId) || {};
  const details = [
    ['ID', order.id],
    ['Time', formatDate(order.time)],
    ['Maker', order.maker],
    ['Maker Size', order.makerSize],
    ['Taker', order.taker],
    ['Taker Size', order.takerSize]
  ];
  openOrderDetailsWindow(details);
});

let updateAvailableWindowOpen = false;

const openUpdateAvailableWindow = (v, windowType, hideCheckbox = false) => new Promise(resolve => { // windowType: updateAvailable|updateDownloaded

  updateAvailableWindowOpen = true;

  const updateAvailableWindow = new BrowserWindow({
    show: false,
    width: 580,
    height: platform === 'win32' ? 375 : platform === 'darwin' ? 355 : 340,
    parent: appWindow
  });
  if(platform !== 'darwin') updateAvailableWindow.setMenu(null);
  if(isDev) {
    updateAvailableWindow.loadURL(`file://${path.join(__dirname, 'src', 'update-available.html')}`);
  } else {
    updateAvailableWindow.loadURL(`file://${path.join(__dirname, 'dist', 'update-available.html')}`);
  }
  updateAvailableWindow.once('ready-to-show', () => {
    updateAvailableWindow.show();
  });
  updateAvailableWindow.once('close', () => {
    updateAvailableWindowOpen = false;
    resolve();
  });
  ipcMain.removeAllListeners('getUpdatedVersion');
  ipcMain.once('getUpdateVersion', e => {
    e.returnValue = v;
  });
  ipcMain.removeAllListeners('cancel');
  ipcMain.once('cancel', async function(e, notAskAgain) {
    if(!hideCheckbox) storage.setItem('ignoreUpdates', notAskAgain ? v : '', true);
    resolve();
    setTimeout(() => {
      updateAvailableWindow.close();
    }, 0);
  });
  ipcMain.removeAllListeners('accept');
  ipcMain.once('accept', () => {
    if(windowType === 'updateAvailable') {
      storage.setItem('ignoreUpdates', '', true);
      autoUpdater.downloadUpdate();
      downloadingUpdate = true;
      updateAvailableWindow.close();
    } else if(windowType === 'updateDownloaded') {
      autoUpdater.quitAndInstall();
    }
  });
  ipcMain.removeAllListeners('getUpdatedWindowType');
  ipcMain.once('getUpdateWindowType', e => {
    e.returnValue = windowType;
  });
  ipcMain.removeAllListeners('hideCheckbox');
  ipcMain.once('hideCheckbox', e => {
    e.returnValue = hideCheckbox;
  });

});

let downloadingUpdate = false;
let updateDownloaded = false;

let downloadedUpdateVersion = '';

autoUpdater.on('update-downloaded', ({ version: v }) => {
  downloadedUpdateVersion = v;
  downloadingUpdate = false;
  updateDownloaded = true;
  openUpdateAvailableWindow(v, 'updateDownloaded');
});
autoUpdater.on('update-available', res => {
  availableUpdate = res;
  const { version: v } = availableUpdate;
  const ignoreUpdates = storage.getItem('ignoreUpdates') || '';
  if(ignoreUpdates && ignoreUpdates === v) return;
  openUpdateAvailableWindow(v, 'updateAvailable');
});
autoUpdater.on('error', err => {
  updateError = true;
  const patternsToIgnore = [
    /update\.yml/,
    /latest\.yml/,
    /update-mac\.yml/,
    /latest-mac\.yml/,
    /update-linux\.yml/,
    /latest-linux\.yml/
  ];
  if(patternsToIgnore.every(p => !p.test(err.message))) {
    handleError(err);
  }
});
ipcMain.on('updateError', e => {
  e.returnValue = updateError;
});
ipcMain.on('checkForUpdates', e => {
  if(downloadingUpdate) {
    e.returnValue = 'downloading';
  } else if(updateDownloaded) {
    if(!updateAvailableWindowOpen) openUpdateAvailableWindow(downloadedUpdateVersion, 'updateDownloaded');
    e.returnValue = 'downloaded';
  } else if(availableUpdate) {
    if(!updateAvailableWindowOpen) openUpdateAvailableWindow(availableUpdate.version, 'updateAvailable', true);
    e.returnValue = 'available';
  } else {
    e.returnValue = 'none';
  }
});

let configurationWindow;

const openConfigurationWindow = (options = {}) => {

  const { isFirstRun = false, error } = options;

  // const errorMessage = error ? 'There was a problem connecting to the Blocknet RPC server. What would you like to do?' : '';
  let errorTitle, errorMessage;
  if(error) {
    console.log(error);
    switch(error.status) {
      case 401:
        errorTitle = 'Authorization Problem';
        errorMessage = 'There was an authorization problem. Please check your Blocknet RPC username and/or password.';
        break;
      default:
        errorTitle = 'Connection Error';
        errorMessage = 'There was a problem connecting to the Blocknet wallet. Make sure the wallet has been configured, restarted, and is open and unlocked.';
    }
    console.log(errorMessage);
  } else {
    errorMessage = '';
  }

  configurationWindow = new BrowserWindow({
    show: false,
    width: 1050,
    height: platform === 'win32' ? 708 : platform === 'darwin' ? 695 : 670,
    parent: appWindow
  });
  if(isDev) {
    configurationWindow.loadURL(`file://${path.join(__dirname, 'src', 'automation.html')}`);
  } else {
    configurationWindow.setMenu(null);
    configurationWindow.loadURL(`file://${path.join(__dirname, 'dist', 'automation.html')}`);
  }
  configurationWindow.once('ready-to-show', () => {
    configurationWindow.show();

    setTimeout(() => {
      if(error) configurationWindow.send('errorMessage', errorTitle, errorMessage);
    }, 200);

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
  } else if(platform === 'darwin') {
    setAppMenu();
  }

  ipcMain.on('isFirstRun', e => {
    e.returnValue = isFirstRun;
  });

  ipcMain.removeAllListeners('openSettingsWindow');
  ipcMain.on('openSettingsWindow', () => {
    try {
      openSettingsWindow();
      configurationWindow.close();
    } catch(err) {
      handleError(err);
    }
  });

  ipcMain.removeAllListeners('getManifest');
  ipcMain.on('getManifest', async function(e) {
    try {
      e.returnValue = getManifest();
    } catch(err) {
      handleError(err);
    }
  });

  ipcMain.removeAllListeners('getBaseConf');
  ipcMain.on('getBaseConf', function(e, walletConf) {
    try {
      const walletConfs = storage.getItem('walletConfs') || {};
      let contents = walletConfs[walletConf];
      if(!contents) {
        const filePath = path.join(configurationFilesDirectory, 'wallet-confs', walletConf);
        contents = fs.readFileSync(filePath, 'utf8');
      }
      e.returnValue = contents;
    } catch(err) {
      handleError(err);
    }
  });

  ipcMain.removeAllListeners('getBridgeConf');
  ipcMain.on('getBridgeConf', (e, bridgeConf) => {
    try {
      const xbridgeConfs = storage.getItem('xbridgeConfs') || {};
      let contents = xbridgeConfs[bridgeConf];
      if(!contents) {
        const filePath = path.join(configurationFilesDirectory, 'xbridge-confs', bridgeConf);
        contents = fs.readFileSync(filePath, 'utf8');
      }
      e.returnValue = contents;
    } catch(err) {
      handleError(err);
    }
  });

  ipcMain.removeAllListeners('saveDXData');
  ipcMain.on('saveDXData', (e, dxUser, dxPassword, dxPort, dxIP) => {
    storage.setItems({
      user: dxUser,
      password: dxPassword,
      port: dxPort,
      blocknetIP: dxIP
    }, true);
    e.returnValue = true;
  });

  ipcMain.removeAllListeners('getHomePath');
  ipcMain.on('getHomePath', e => {
    e.returnValue = app.getPath('home');
  });

  ipcMain.removeAllListeners('getDataPath');
  ipcMain.on('getDataPath', e => {
    e.returnValue = app.getPath('appData');
  });

  ipcMain.removeAllListeners('getSelected');
  ipcMain.on('getSelected', e => {
    const selectedWallets = storage.getItem('selectedWallets') || [];
    e.returnValue = selectedWallets;
  });

  ipcMain.removeAllListeners('saveSelected');
  ipcMain.on('saveSelected', (e, selectedArr) => {
    storage.setItem('selectedWallets', selectedArr, true);
    e.returnValue = selectedArr;
  });

  ipcMain.removeAllListeners('configurationWindowCancel');
  ipcMain.on('configurationWindowCancel', () => {
    if(appWindow) {
      configurationWindow.close();
    } else {
      app.quit();
    }
  });

};

ipcMain.on('closeConfigurationWindow', e => {
  configurationWindow.close();
});
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
  ipcMain.on('getBlocknetIP', e => {
    e.returnValue = storage.getItem('blocknetIP') || '';
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
    height: platform === 'win32' ? 640 : platform === 'darwin' ? 625 : 600,
    parent: appWindow
  });
  if(isDev) {
    settingsWindow.loadURL(`file://${path.join(__dirname, 'src', 'settings.html')}`);
  } else {
    settingsWindow.setMenu(null);
    settingsWindow.loadURL(`file://${path.join(__dirname, 'dist', 'settings.html')}`);
  }
  settingsWindow.once('ready-to-show', () => {
    settingsWindow.show();
    if(errorMessage) {
      settingsWindow.send('errorMessage', errorMessage);
    }
    if(configurationWindow) {
      try {
        configurationWindow.close();
      } catch(err) {
        console.error(err);
      }
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
  } else if(platform === 'darwin') {
    setAppMenu();
  }

};

ipcMain.on('setXbridgeConfPath', (e, p = '') => {
  storage.setItem('xbridgeConfPath', p);
});
ipcMain.on('getXbridgeConfPath', (e) => {
  e.returnValue = storage.getItem('xbridgeConfPath') || '';
});
ipcMain.on('getUser', e => {
  e.returnValue = storage.getItem('user') || '';
});
ipcMain.on('getPassword', e => {
  e.returnValue = storage.getItem('password') || '';
});
ipcMain.on('getPort', e => {
  e.returnValue = storage.getItem('port') || '';
});
ipcMain.on('getBlocknetIP', e => {
  e.returnValue = storage.getItem('blocknetIP') || '';
});

const openGeneralSettingsWindow = () => {

  const generalSettingsWindow = new BrowserWindow({
    show: false,
    width: 1000,
    height: platform === 'win32' ? 708 : platform === 'darwin' ? 695 : 670,
    parent: appWindow,
    modal: platform === 'darwin' ? false : true
  });

  generalSettingsWindow.setMenu(null);

  if(isDev) {
    generalSettingsWindow.loadURL(`file://${path.join(__dirname, 'src', 'general-settings.html')}`);
  } else {
    generalSettingsWindow.loadURL(`file://${path.join(__dirname, 'dist', 'general-settings.html')}`);
  }
  generalSettingsWindow.once('ready-to-show', () => {
    generalSettingsWindow.show();
  });

};

let informationWindow;

const openInformationWindow = () => {
  informationWindow = new BrowserWindow({
    show: false,
    width: 1000,
    height: platform === 'win32' ? 708 : platform === 'darwin' ? 695 : 670,
    parent: appWindow,
    modal: platform === 'darwin' ? false : true
  });

  informationWindow.setMenu(null);

  if(isDev) {
    informationWindow.loadURL(`file://${path.join(__dirname, 'src', 'information.html')}`);
  } else {
    informationWindow.loadURL(`file://${path.join(__dirname, 'dist', 'information.html')}`);
  }
  informationWindow.once('ready-to-show', () => {
    informationWindow.show();
  });

};

ipcMain.on('closeInformationWindow', e => {
  informationWindow.close();
});

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
    height = alreadyAccepted ? 670 : 745;
  } else if(process.platform === 'darwin') {
    height = alreadyAccepted ? 655 : 730;
  } else {
    height = alreadyAccepted ? 645 : 700;
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

  tosWindow.setMenu(null);
};

const openAppWindow = () => {

  let { height } = electron.screen.getPrimaryDisplay().workAreaSize;
  height -= 300;
  let width = Math.floor(height * 1.5);
  appWindow = new BrowserWindow({
    show: false,
    width: Math.max(width, 1050),
    height: Math.max(height, 760)
  });

  const initialBounds = storage.getItem('bounds');
  if(initialBounds) {
    try {
      appWindow.setBounds(initialBounds);
    } catch(err) {
      appWindow.maximize();
    }
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
      // setTimeout(() => app.quit(), 1);
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

  setAppMenu();

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
          sendOrderHistory();
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

  const getOrders = async function() {
    const orders = await sn.dxGetOrders();
    return orders;
  };

  const sendOrderBook = force => {
    if (isTokenPairValid(keyPair))
      sn.dxGetOrderBook3(keyPair[0], keyPair[1], 250)
        .then(async function(res) {
          if(force === true || JSON.stringify(res) !== JSON.stringify(orderBook)) {
            orderBook = res;
            const allOrders = await getOrders();
            const orderTotals = new Map(allOrders.map(({ id, makerSize, takerSize }) => [id, [makerSize, takerSize]]));
            const orderBookWithTotals = Object.assign({}, res, {
              asks: res.asks.map(a => {
                const order = orderTotals.get(a.orderId);
                const total = a.size === order[0] ? order[1] : order[0];
                return Object.assign({}, a, {total});
              }),
              bids: res.bids.map(b => {
                const order = orderTotals.get(b.orderId);
                const total = b.size === order[0] ? order[1] : order[0];
                return Object.assign({}, b, {total});
              })
            });
            appWindow.send('orderBook', orderBookWithTotals);
          }
        })
        .catch(handleError);
  };
  ipcMain.on('getOrderBook', () => sendOrderBook(true));
  setInterval(sendOrderBook, stdInterval);

  tradeHistory = [];
  const sendTradeHistory = force => {
    if (isTokenPairValid(keyPair))
      sn.dxGetOrderFills(keyPair[0], keyPair[1])
        .then(res => {
          if(force === true || JSON.stringify(res) !== JSON.stringify(tradeHistory)) {
            tradeHistory = res;
            appWindow.send('tradeHistory', tradeHistory, keyPair);
          }
        })
        .catch(handleError);
  };
  ipcMain.on('getTradeHistory', () => sendTradeHistory(true));
  setInterval(sendTradeHistory, stdInterval);

  const sendLocalTokens = async function() {
    const localTokens = await sn.dxGetLocalTokens();
    appWindow.send('localTokens', localTokens);
  };
  ipcMain.on('getLocalTokens', sendLocalTokens);

  const manifestData = getManifest();
  const availableTokens = new Set(manifestData.map(d => d.ticker));
  const tokenNames = manifestData
    .reduce((map, d) => {
      return map.set(d.ticker, d.blockchain);
    }, new Map());

  ipcMain.on('getTokenName', (e, ticker) => {
    e.returnValue = tokenNames.get(ticker) || ticker;
  });

  const sendNetworkTokens = async function() {
    const networkTokens = await sn.dxGetNetworkTokens();
    const filteredTokens = networkTokens.filter(t => availableTokens.has(t));
    appWindow.send('networkTokens', filteredTokens);
  };
  ipcMain.on('getNetworkTokens', sendNetworkTokens);

  // Token refresh interval
  setInterval(() => {
    sendNetworkTokens();
    sendLocalTokens();
  }, 15000);

  myOrders = [];
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

  const calculatePricingData = orderHistory => {
    if (!orderHistory || orderHistory.length === 0)
      return { time: moment.utc().toISOString(), open: 0, close: 0, high: 0, low: 0, volume: 0 };
    let vol = 0, open = 0, close = 0, high = 0, low = null;
    for (let i = 0; i < orderHistory.length; i++) {
      let r = orderHistory[i];
      vol += r.volume;
      if (r.high > high)
        high = r.high;
      if (r.low !== 0 && (r.low < low || low === null))
        low = r.low;
      if (open === 0 && r.open !== 0)
        open = r.open;
      if (r.close !== 0)
        close = r.close;
    }
    if (low === null)
      low = 0;
    const last = orderHistory[orderHistory.length - 1];
    return { time: last.time, open: open, close: close, high: high, low: low, volume: vol };
  };

  const orderKey = (pair) => pair[0] + pair[1];
  let orderHistoryDict = new Map();

  const sendOrderHistory = (which) => {
    if (!isTokenPairValid(keyPair)) // need valid token pair
      return;
    const key = orderKey(keyPair);
    const shouldUpdate = !orderHistoryDict.has(key) ||
      (moment.utc().diff(orderHistoryDict[key]['orderHistoryLastUpdate'], 'seconds', true) >= 15);
    if (!shouldUpdate) {
      if (orderHistoryDict.has(key) && which)
        appWindow.send(which, orderHistoryDict[key][which]);
      return;
    }

    // Make sure storage has key
    if (!orderHistoryDict.has(key))
      orderHistoryDict[key] = {
        'orderHistory': [],
        'orderHistoryByMinute': [],
        'orderHistoryBy15Minutes': [],
        'orderHistoryBy1Hour': [],
        'currentPrice': { time: moment.utc().toISOString(), open: 0, close: 0, high: 0, low: 0, volume: 0 },
        'orderHistoryLastUpdate': moment.utc()
      };
    else
      orderHistoryDict[key]['orderHistoryLastUpdate'] = moment.utc();

    const end = moment().utc();
    const start = end.clone().subtract(1, 'day');

    {
      sn.dxGetOrderHistory(keyPair[0], keyPair[1], start.unix(), end.unix(), 60)
        .then(res => {
          orderHistoryDict[key]['orderHistory'] = res;
          orderHistoryDict[key]['orderHistoryByMinute'] = res;
          orderHistoryDict[key]['currentPrice'] = calculatePricingData(res);
          if (key === orderKey(keyPair)) {
            appWindow.send('orderHistory', res);
            appWindow.send('orderHistoryByMinute', res);
            appWindow.send('currentPrice', orderHistoryDict[key]['currentPrice']);
          }
        })
        .catch(handleError);
    }
    {
      sn.dxGetOrderHistory(keyPair[0], keyPair[1], start.unix(), end.unix(), 900)
        .then(res => {
          orderHistoryDict[key]['orderHistoryBy15Minutes'] = res;
          if (key === orderKey(keyPair))
            appWindow.send('orderHistoryBy15Minutes', res);
        })
        .catch(handleError);
    }
    {
      sn.dxGetOrderHistory(keyPair[0], keyPair[1], start.unix(), end.unix(), 3600)
        .then(res => {
          orderHistoryDict[key]['orderHistoryBy1Hour'] = res;
          if (key === orderKey(keyPair))
            appWindow.send('orderHistoryBy1Hour', res);
        })
        .catch(handleError);
    }
  };

  ipcMain.on('getOrderHistory', () => sendOrderHistory('orderHistory'));
  ipcMain.on('getOrderHistoryByMinute', () => sendOrderHistory('orderHistoryByMinute'));
  ipcMain.on('getOrderHistoryBy15Minutes', () => sendOrderHistory('orderHistoryBy15Minutes'));
  ipcMain.on('getOrderHistoryBy1Hour', () => sendOrderHistory('orderHistoryBy1Hour'));
  ipcMain.on('getCurrentPrice', () => sendOrderHistory('currentPrice'));

  setInterval(sendOrderHistory, 30000);

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
      const end = moment.utc();
      const start = end.clone().subtract(1, 'day');

      for(const token of networkTokens) {
        const second = token === comparator ? networkTokens.find(t => t !== comparator) : comparator;
        const res = await sn.dxGetOrderHistory(token, second, start.unix(), end.unix(), 86400);
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
      const end = moment.utc();
      const start = end.clone().subtract(1, 'day');

      for(const second of networkTokens) {
        if(second === primary) continue;
        const res = await sn.dxGetOrderHistory(primary, second, start.unix(), end.unix(), 86400);
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

  ipcMain.on('refreshBalances', async function() {
    try {
      await loadXBridgeConf();
      await sendNetworkTokens();
      await sendLocalTokens();
      await sendBalances(true);
    } catch(err) {
      console.error(err);
    }
  });

  sendPricingMultipliers = async function() {
    try {
      if(!enablePricing) {
        appWindow.send('pricingMultipliers', []);
        return;
      }
      const pricingInterface = new PricingInterface({
        source: pricingSource,
        apiKey: apiKeys[pricingSource]
      });
      const multipliers = await pricingInterface.compare([keyPair[1], keyPair[0]], pricingUnit);
      appWindow.send('pricingMultipliers', multipliers);
    } catch(err) {
      handleError(err);
    }
  };

  let pricingInterval;

  clearPricingInterval = () => {
    clearInterval(pricingInterval);
  };
  setPricingInterval = () => {
    pricingInterval = setInterval(() => {
      if (isTokenPairValid(keyPair))
        sendPricingMultipliers();
    }, pricingFrequency);
  };

  setPricingInterval();

  ipcMain.on('getPricing', () => {
    sendPricingMultipliers();
  });

   sendMarketPricingEnabled = () => {
    appWindow.send('marketPricingEnabled', enablePricing);
  };

  ipcMain.on('getMarketPricingEnabled', sendMarketPricingEnabled);

  ipcMain.on('setKeyPair', (e, pair) => {

    clearPricingInterval();

    storage.setItem('keyPair', pair);
    keyPair = pair;
    sendKeyPair();
    sendOrderBook(true);
    sendTradeHistory(true);
    sendMyOrders(true);
    sendOrderHistory();

    sendPricingMultipliers();
    setPricingInterval();

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

  ipcMain.on('getKeyPairSync', e => {
    e.returnValue = keyPair;
  });

  ipcMain.on('openGeneralSettings', () => {
    openGeneralSettingsWindow();
  });

  ipcMain.on('openInformation', () => {
    openInformationWindow();
  });

  ipcMain.on('openConfigurationWizard', () => {
    openConfigurationWindow();
  });

  ipcMain.on('openTOS', () => {
    openTOSWindow(true);
  });

};

ipcMain.on('openSettings', () => {
  openSettingsWindow();
});

ipcMain.on('getPricingSource', e => {
  e.returnValue = pricingSource;
});
ipcMain.on('getAPIKeys', e => {
  e.returnValue = apiKeys;
});
ipcMain.on('getPricingUnit', e => {
  e.returnValue = pricingUnit;
});
ipcMain.on('getPricingFrequency', e => {
  e.returnValue = pricingFrequency;
});
ipcMain.on('getPricingEnabled', e => {
  e.returnValue = enablePricing;
});
ipcMain.on('saveGeneralSettings', (e, s) => {
  // console.log(JSON.stringify(s, null, '  '));
  enablePricing = s.pricingEnabled;
  pricingSource = s.pricingSource;
  apiKeys = s.apiKeys;
  pricingUnit = s.pricingUnit;
  pricingFrequency = s.pricingFrequency;
  storage.setItems({
    pricingEnabled: s.pricingEnabled,
    pricingSource: s.pricingSource,
    apiKeys: s.apiKeys,
    pricingUnit: s.pricingUnit,
    pricingFrequency: s.pricingFrequency
  }, true);
  clearPricingInterval();
  sendPricingMultipliers();
  setPricingInterval();
  sendMarketPricingEnabled();
});

const loadXBridgeConf = async function() {
  await sn.dxLoadXBridgeConf();
};

ipcMain.on('loadXBridgeConf', async function() {
  try {
    await loadXBridgeConf();
  } catch(err) {
    console.error(err);
  }
});

const checkForUpdates = async function() {
  try {
    await new Promise(resolve => setTimeout(resolve, 3000));
    if(!isDev) {
      await autoUpdater.checkForUpdates();
    } else {
      updateError = true;
    }
  } catch(err) {
    updateError = true;
  }
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

    metaPath = path.join(dataPath, 'app-meta.json');
    storage = new SimpleStorage(metaPath);
    user = storage.getItem('user');
    password = storage.getItem('password');
    port = storage.getItem('port');
    let ip = storage.getItem('blocknetIP');

    pricingSource = storage.getItem('pricingSource');
    if(!pricingSource) {
      pricingSource = 'CRYPTO_COMPARE';
      storage.setItem('pricingSource', pricingSource);
    }
    apiKeys = storage.getItem('apiKeys');
    if(!apiKeys) {
      apiKeys = {};
      storage.setItem('apiKeys', apiKeys);
    }
    pricingUnit = storage.getItem('pricingUnit');
    if(!pricingUnit) {
      pricingUnit = 'BTC';
      storage.setItem('pricingUnit', pricingUnit);
    }
    pricingFrequency = storage.getItem('pricingFrequency');
    if(!pricingFrequency) {
      pricingFrequency = 15000;
      storage.setItem('pricingFrequency', pricingFrequency);
    }
    enablePricing = storage.getItem('pricingEnabled');
    if(!enablePricing && enablePricing !== false) {
      enablePricing = false;
      storage.setItem('pricingEnabled', enablePricing);
    }

    if(!storage.getItem('addresses')) {
      storage.setItem('addresses', {});
    }

    // Flag used to disable the conf updater, default to false
    const disableUpdater = storage.getItem('confUpdaterDisabled');
    if (_.isNull(disableUpdater) || _.isUndefined(disableUpdater))
      storage.setItem('confUpdaterDisabled', false);

    if(!storage.getItem('tos')) {
      await onReady;
      openTOSWindow();
      return;
    }

    if(!port) {
      port = '41414';
      storage.setItem('port', port);
    }

    if(!ip) {
      ip = '127.0.0.1';
      storage.setItem('blocknetIP', ip);
    }

    if (!storage.getItem('confUpdaterDisabled')) {
      try {
        const confController = new ConfController({ storage });
        await confController.update();
      } catch(err) {
        console.error(err);
      }
    }

    if(!user || !password) {
      await onReady;
      openConfigurationWindow({isFirstRun: true});
      checkForUpdates();
      return;
    }

    sn = new ServiceNodeInterface(user, password, `http://${ip}:${port}`);

    await new Promise(resolve => setTimeout(resolve, 2000));

    try {
      info = await sn.getinfo();
    } catch(err) {
      await onReady;

      checkForUpdates();
      openConfigurationWindow({ error: err });
      return;
    }

    keyPair = storage.getItem('keyPair');
    if(!isTokenPairValid(keyPair)) {

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
      keyPair = keyPair.map(t => _.isNil(t) ? '' : t); // Sanitize tokens list
      storage.setItem('keyPair', keyPair);
    }

    const localhost = 'localhost';

    // In development use the live ng server. In production serve the built files
    if(isDev) {
      serverLocation =  `http://${localhost}:4200`;
    }

    await onReady;

    checkForUpdates();

    openAppWindow();

  } catch(err) {
    handleError(err);
  }

})();

function isTokenPairValid(keyPair) {
  return keyPair && keyPair.length === 2
    && !_.isNil(keyPair[0]) && !_.isNil(keyPair[1])
    && !_.isEmpty(keyPair[0]) && !_.isEmpty(keyPair[1]);
}

// check for version number. Minimum supported blocknet client version
function versionCheck(version) {
  if (version < 3130000) {
    return {name: 'Unsupported Version', message: 'BLOCK DX requires Blocknet wallet version 3.13.0 or greater.'};
  }
  return null;
}
