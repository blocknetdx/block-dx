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
const math = require('mathjs');
const MarkdownIt = require('markdown-it');
const { Localize } = require('./src-back/localize');
const { blocknetDir4, blocknetDir3, BLOCKNET_CONF_NAME4, BLOCKNET_CONF_NAME3, ipcMainListeners, pricingSources } = require('./src-back/constants');
const { checkAndCopyV3Configs } = require('./src-back/config-updater');
const { MainSwitch } = require('./src-back/main-switch');
const { openUnverifiedAssetWindow } = require('./src-back/windows/unverified-asset-window');
const { openMessageBox } = require('./src-back/windows/message-box');
const { logger } = require('./src-back/logger');
const { RecursiveInterval } = require('./src-back/recursive-interval');

const versionDirectories = [
  blocknetDir4,
  blocknetDir3
];
const blocknetConfNames = [
  BLOCKNET_CONF_NAME4,
  BLOCKNET_CONF_NAME3
];

const getHomePath = () => app.getPath('home');
const getDataPath = () => app.getPath('appData');

const fileExists = p => {
  try {
    fs.statSync(p);
    return true;
  } catch(err) {
    return false;
  }
};

const defaultLocale = 'en';

math.config({
  number: 'BigNumber',
  precision: 64
});

const md = new MarkdownIt();

const { app, BrowserWindow: ElectronBrowserWindow, Menu, ipcMain } = electron;

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
  sendMarketPricingEnabled, metaPath, availableUpdate, tradeHistory, myOrders, showWallet, tosWindow, releaseNotesWindow,
  latestBlocknetDir, latestConfName;
let updateError = false;

// Handle explicit quit
ipcMain.on('quitResetFirstRun', () => {
  if (storage)
    storage.setItem('isFirstRun', true);
  app.quit();
});

ipcMain.on('getPlatform', e => e.returnValue = process.platform);

const configurationFilesDirectory = path.join(__dirname, 'blockchain-configuration-files');

const getManifest = () => {
  let manifest = storage.getItem('manifest');
  if(!manifest) {
    const filePath = path.join(configurationFilesDirectory, 'manifest-latest.json');
    manifest = fs.readJsonSync(filePath);
  }
  const blockIdx = manifest.findIndex(t => t.ticker === 'BLOCK');
  const blockDirectories = versionDirectories[0];
  manifest[blockIdx] = Object.assign({}, manifest[blockIdx], {
    conf_name: blocknetConfNames[0],
    dir_name_linux: blockDirectories.linux,
    dir_name_mac: blockDirectories.darwin,
    dir_name_win: blockDirectories.win32
  });
  return manifest;
};

const maxZoom = 1.5;
const minZoom = .6;
const zoomIncrement = .1;

const zoomIn = () => {
  const zoomFactor = storage.getItem('zoomFactor');
  if(zoomFactor < maxZoom) {
    const windows = ElectronBrowserWindow.getAllWindows();
    const newZoomFactor = zoomFactor + zoomIncrement;
    windows.forEach(w => {
      w.send('ZOOM_IN', newZoomFactor);
    });
    storage.setItem('zoomFactor', newZoomFactor);
  }
};
const zoomOut = () => {
  const zoomFactor = storage.getItem('zoomFactor');
  if(zoomFactor > minZoom) {
    const windows = ElectronBrowserWindow.getAllWindows();
    const newZoomFactor = zoomFactor - zoomIncrement;
    windows.forEach(w => {
      w.send('ZOOM_OUT', newZoomFactor);
    });
    storage.setItem('zoomFactor', newZoomFactor);
  }
};
const zoomReset = () => {
  const windows = ElectronBrowserWindow.getAllWindows();
  windows.forEach(w => {
    w.send('ZOOM_RESET');
  });
  storage.setItem('zoomFactor', 1);
};

const setAppMenu = () => {

  const menuTemplate = [];

  // File Menu
  menuTemplate.push({
    label: Localize.text('File', 'universal'),
    submenu: [
      { role: 'quit' }
    ]
  });

  // Edit Menu
  menuTemplate.push({
    label: Localize.text('Edit', 'universal'),
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

  // Edit Menu
  menuTemplate.push({
    label: Localize.text('View', 'universal'),
    submenu: [
      {
        label: Localize.text('Zoom In', 'univeral'),
        click: zoomIn
      },
      {
        label: Localize.text('Zoom Out', 'univeral'),
        click: zoomOut
      },
      {
        type: 'separator'
      },
      {
        label: Localize.text('Reset Zoom', 'univeral'),
        click: zoomReset
      }
    ]
});

  // Window Menu
  if(isDev) {
    menuTemplate.push({
      label: Localize.text('Window', 'universal'),
      submenu: [
        { label: 'Show Dev Tools', role: 'toggledevtools' }
      ]
    });
  }

  const appMenu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(appMenu);

};

ipcMain.on('ZOOM_IN', zoomIn);
ipcMain.on('ZOOM_OUT', zoomOut);
ipcMain.on('ZOOM_RESET', zoomReset);

// General Error Handler
const handleError = err => {
  logger.error(err.message + '\n' + err.stack);
};
const displayError = err => {
  handleError(err);
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
const unlocked = app.requestSingleInstanceLock();
if(!unlocked) {
  app.quit();
}
app.on('second-instance', () => {
  if(appWindow) {
    if (appWindow.isMinimized()) appWindow.restore();
    appWindow.focus();
  }
});

const openOrderDetailsWindow = details => {

  let height;
  if(process.platform === 'win32') {
    height = isDev ? 680 : 662;
  } else if(process.platform === 'darwin') {
    height = 655;
  } else { // Linux
    height = 645;
  }

  const detailsWindow = new ElectronBrowserWindow({
    show: false,
    width: 800,
    height,
    parent: appWindow,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
    }
  });
  if(isDev) {
    detailsWindow.loadURL(`file://${path.join(__dirname, 'src', 'order-details.html')}`);
  } else {
    detailsWindow.loadURL(`file://${path.join(__dirname, 'dist', 'order-details.html')}`);
  }
  detailsWindow.once('ready-to-show', () => {
    detailsWindow.webContents.setZoomFactor(storage.getItem('zoomFactor'));
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

  const updateAvailableWindow = new ElectronBrowserWindow({
    show: false,
    width: 580,
    height: platform === 'win32' ? 375 : platform === 'darwin' ? 355 : 340,
    parent: appWindow,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
    }
  });
  if(platform !== 'darwin') updateAvailableWindow.setMenu(null);
  if(isDev) {
    updateAvailableWindow.loadURL(`file://${path.join(__dirname, 'src', 'update-available.html')}`);
  } else {
    updateAvailableWindow.loadURL(`file://${path.join(__dirname, 'dist', 'update-available.html')}`);
  }
  updateAvailableWindow.once('ready-to-show', () => {
    updateAvailableWindow.webContents.setZoomFactor(storage.getItem('zoomFactor'));
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
  storage.setItem('showReleaseNotes', true, true);
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
    handleError(error);
    switch(error.status) {
      case 401:
        errorTitle = Localize.text('Authorization Problem', 'configurationWindow');
        errorMessage = Localize.text('There was an authorization problem. Please check your Blocknet RPC username and/or password.', 'configurationWindow');
        break;
      default:
        errorTitle = Localize.text('Connection Error', 'configurationWindow');
        errorMessage = Localize.text('There was a problem connecting to the Blocknet wallet. Make sure the wallet has been configured, restarted, and is open and unlocked.', 'configurationWindow');
    }
    logger.info(errorMessage);
  } else {
    errorMessage = '';
  }

  configurationWindow = new ElectronBrowserWindow({
    show: false,
    width: 1050,
    height: platform === 'win32' ? 708 : platform === 'darwin' ? 695 : 670,
    parent: appWindow,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
    }
  });
  if(isDev) {
    configurationWindow.loadURL(`file://${path.join(__dirname, 'src', 'configuration.html')}`);
  } else {
    configurationWindow.setMenu(null);
    configurationWindow.loadURL(`file://${path.join(__dirname, 'dist', 'configuration.html')}`);
  }
  configurationWindow.once('ready-to-show', () => {
    configurationWindow.webContents.setZoomFactor(storage.getItem('zoomFactor'));
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
      displayError(err);
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
      electron.dialog.showErrorBox(err.message, `There was a problem opening ${walletConf}.`);
      e.returnValue = '';
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
      electron.dialog.showErrorBox(err.message, `There was a problem opening ${bridgeConf}.`);
      e.returnValue = '';
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
    e.returnValue = getHomePath();
  });

  ipcMain.removeAllListeners('getDataPath');
  ipcMain.on('getDataPath', e => {
    e.returnValue = getDataPath();
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

ipcMain.on('getManifest', async function(e) {
  try {
    e.returnValue = getManifest();
  } catch(err) {
    handleError(err);
  }
});

ipcMain.on('checkTokensAgainstManifest', async function(e, tokens = []) {
  try {
    const manifest = getManifest();
    const verifiedTokens = new Set(manifest.map(({ ticker }) => ticker));
    e.returnValue = tokens.reduce((obj, t) => Object.assign({}, obj, {[t]: verifiedTokens.has(t)}), {});
  } catch(err) {
    handleError(err);
  }
});

ipcMain.on('getDoNotShowWarningAssetPairs', e => {
  const doNotShowWarningPairs = storage.getItem('doNotShowAssetPairs') || [];
  e.returnValue = doNotShowWarningPairs;
});
ipcMain.on('addToDoNotShowWarningAssetPairs', (e, pair) => {
  const doNotShowWarningPairs = storage.getItem('doNotShowAssetPairs') || [];
  storage.setItem('doNotShowAssetPairs', [...doNotShowWarningPairs, pair]);
});

const getBaseDataPath = () => (platform === 'win32' || platform === 'darwin') ? getDataPath() : getHomePath();

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
    handleError(error);
    switch(error.status) {
      case 401:
        errorMessage = Localize.text('There was an authorization problem. Please correct your username and/or password.', 'settingsWindow');
        break;
      default:
        errorMessage = Localize.text('There was a problem connecting to the Blocknet RPC server. Please check the RPC port.', 'settingsWindow');
    }
    logger.info(errorMessage);
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

  const settingsWindow = new ElectronBrowserWindow({
    show: false,
    width: 500,
    height: platform === 'win32' ? 640 : platform === 'darwin' ? 625 : 600,
    parent: appWindow,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
    }
  });
  if(isDev) {
    settingsWindow.loadURL(`file://${path.join(__dirname, 'src', 'rpc-settings.html')}`);
  } else {
    settingsWindow.setMenu(null);
    settingsWindow.loadURL(`file://${path.join(__dirname, 'dist', 'rpc-settings.html')}`);
  }
  settingsWindow.once('ready-to-show', () => {
    settingsWindow.webContents.setZoomFactor(storage.getItem('zoomFactor'));
    settingsWindow.show();
    if(errorMessage) {
      settingsWindow.send('errorMessage', errorMessage);
    }
    if(configurationWindow) {
      try {
        configurationWindow.close();
      } catch(err) {
        handleError(err);
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

ipcMain.on('setTokenPaths', (e, wallets) => {
  let tokenPaths;
  if(wallets) {
    const origTokenPaths = storage.getItem('tokenPaths') || {};
    tokenPaths = wallets.reduce((obj, { directory, abbr }) => {
      return Object.assign({}, obj, {[abbr]: directory});
    }, origTokenPaths);
  } else {
    tokenPaths = {};
  }
  storage.setItem('tokenPaths', tokenPaths, true);
  e.returnValue = true;
});
ipcMain.on('getTokenPath', (e, token) => {
  const tokenPaths = storage.getItem('tokenPaths') || {};
  e.returnValue = tokenPaths[token] || '';
});
ipcMain.on('setXbridgeConfPath', (e, p = '') => {
  storage.setItem('xbridgeConfPath', p);
});

const getCustomXbridgeConfPath = () => {
  return storage.getItem('xbridgeConfPath') || '';
};
ipcMain.on('getXbridgeConfPath', (e) => {
  e.returnValue = getCustomXbridgeConfPath();
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

const getDefaultCCDirectory = () => {
  if(platform === 'win32') { // Windows
    return path.join(electron.app.getPath('appData'), 'CloudChains');
  } else if(platform === 'darwin') { // Mac
    return path.join(electron.app.getPath('appData'), 'CloudChains');
  } else { // Linux
    return path.join(electron.app.getPath('appData'), 'CloudChains');
  }
};

ipcMain.on('getLitewalletConfigDirectory', e => {
  let litewalletConfigDirectory = storage.getItem('litewalletConfigDirectory') || getDefaultCCDirectory();
  if(!fs.existsSync(litewalletConfigDirectory)) {
    litewalletConfigDirectory = '';
  }
  e.returnValue = litewalletConfigDirectory;
});

ipcMain.on('saveLitewalletConfigDirectory', (e, litewalletConfigDirectory) => {
  storage.setItem('litewalletConfigDirectory', litewalletConfigDirectory);
});

const openGeneralSettingsWindow = () => {

  const generalSettingsWindow = new ElectronBrowserWindow({
    show: false,
    width: 1000,
    height: platform === 'win32' ? 708 : platform === 'darwin' ? 695 : 670,
    parent: appWindow,
    modal: platform === 'darwin' ? false : true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
    }
  });

  generalSettingsWindow.setMenu(null);

  if(isDev) {
    generalSettingsWindow.loadURL(`file://${path.join(__dirname, 'src', 'settings.html')}`);
  } else {
    generalSettingsWindow.loadURL(`file://${path.join(__dirname, 'dist', 'settings.html')}`);
  }
  generalSettingsWindow.once('ready-to-show', () => {
    generalSettingsWindow.webContents.setZoomFactor(storage.getItem('zoomFactor'));
    generalSettingsWindow.show();
  });

};

ipcMain.on('getShowWallet', e => {
  e.returnValue = showWallet;
});
ipcMain.on('getShowAllOrders', e => {
  e.returnValue = storage.getItem('showAllOrders');
});

const getShowAllOrdersFromXbridgeConf = () => {
  const split = getSplitXBridgeConf();
  if(split.length > 0) { // If a valid xbridge conf was found
    const idx = split.findIndex(l => /^ShowAllOrders=/.test(l));
    if(idx > -1) { // if it has been found in xbridge conf
      const splitValue = split[idx].split('=');
      if(splitValue.length > 1 && splitValue[1].trim() === 'true') {
        return true;
      } else {
        return false;
      }
    } else { // if it wasn't found in xbridge conf
      return false;
    }
  } else { // If xbridge conf wasn't found
    return null;
  }
};

ipcMain.on('getShowAllOrdersFromXbridgeConf', e => {
  e.returnValue = getShowAllOrdersFromXbridgeConf();
});

let informationWindow;

const openInformationWindow = () => {
  informationWindow = new ElectronBrowserWindow({
    show: false,
    width: 1000,
    height: platform === 'win32' ? 708 : platform === 'darwin' ? 695 : 670,
    parent: appWindow,
    modal: platform === 'darwin' ? false : true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
    }
  });

  informationWindow.setMenu(null);

  if(isDev) {
    informationWindow.loadURL(`file://${path.join(__dirname, 'src', 'information.html')}`);
  } else {
    informationWindow.loadURL(`file://${path.join(__dirname, 'dist', 'information.html')}`);
  }
  informationWindow.once('ready-to-show', () => {
    informationWindow.webContents.setZoomFactor(storage.getItem('zoomFactor'));
    informationWindow.show();
  });

};

ipcMain.on('closeInformationWindow', e => {
  informationWindow.close();
});

const openReleaseNotesWindow = () => {

  storage.setItem('showReleaseNotes', false);

  let height;
  if(process.platform === 'win32') {
    height = 670;
  } else if(process.platform === 'darwin') {
    height = 655;
  } else {
    height = 645;
  }

  releaseNotesWindow = new ElectronBrowserWindow({
    show: false,
    width: 500,
    height: height,
    parent: appWindow,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
    }
  });
  if(isDev) {
    releaseNotesWindow.loadURL(`file://${path.join(__dirname, 'src', 'release-notes.html')}`);
  } else {
    releaseNotesWindow.loadURL(`file://${path.join(__dirname, 'dist', 'release-notes.html')}`);
  }
  releaseNotesWindow.once('ready-to-show', () => {
    releaseNotesWindow.webContents.setZoomFactor(storage.getItem('zoomFactor'));
    releaseNotesWindow.show();
  });

  releaseNotesWindow.setMenu(null);
};
ipcMain.on('openReleaseNotesWindow', () => {
  openReleaseNotesWindow();
});
ipcMain.on('closeReleaseNotesWindow', () => {
  releaseNotesWindow.close();
});

ipcMain.on('getReleaseNotes', event => {
  try {
    const releaseNotesDir = path.join(__dirname, 'release-notes');
    const noteFiles = fs.readdirSync(releaseNotesDir);
    const filePattern = new RegExp(_.escapeRegExp(`${version}.md`), 'i');
    const fileName = noteFiles.find(f => filePattern.test(f));
    if(!fileName) return event.returnValue = '';
    const contents = fs.readFileSync(path.join(releaseNotesDir, fileName), 'utf8');
    event.returnValue = contents;
  } catch(err) {
    event.returnValue = '';
    handleError(err);
  }
});

const openTOSWindow = (alreadyAccepted = false) => {

  ipcMain.on('getTOS', e => {
    try {
      const locale = getUserLocale();
      const text = fs.readFileSync(path.join(__dirname, 'tos.txt'), 'utf8');
      e.returnValue = text;
    } catch(err) {
      handleError(err);
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

  tosWindow = new ElectronBrowserWindow({
    show: false,
    width: 500,
    height: height,
    parent: appWindow,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
    }
  });
  if(isDev) {
    tosWindow.loadURL(`file://${path.join(__dirname, 'src', 'tos.html')}`);
  } else {
    tosWindow.loadURL(`file://${path.join(__dirname, 'dist', 'tos.html')}`);
  }
  tosWindow.once('ready-to-show', () => {
    tosWindow.webContents.setZoomFactor(storage.getItem('zoomFactor'));
    tosWindow.show();
  });

  tosWindow.setMenu(null);
};
ipcMain.on('closeTOS', () => {
  tosWindow.close();
});

const openAppWindow = () => {

  let { height } = electron.screen.getPrimaryDisplay().workAreaSize;
  height -= 300;
  const width = Math.floor(height * 1.5);
  appWindow = new ElectronBrowserWindow({
    show: false,
    width: Math.max(width, 1050),
    height: Math.max(height, 760),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
    }
    // Below is the proper way to set the initial window zoom factor, but there is a bug
    // in Electron 3 which causes it to not work correctly. When we upgrade, we can
    // un-comment this section and remove the setZoomFactor() from the 'ready-to-show' event
    // webPreferences: {
    //   zoomFactor: storage.getItem('zoomFactor')
    // }
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
    appWindow.webContents.setZoomFactor(storage.getItem('zoomFactor'));
    appWindow.show();
  });

  appWindow.once('show', () => {
    // Show release notes if newly updated
    const showReleaseNotes = storage.getItem('showReleaseNotes');
    if(showReleaseNotes) openReleaseNotesWindow();
  });

  appWindow.on('close', () => {
    try {
      const bounds = appWindow.getBounds();
      storage.setItem('bounds', bounds);
    } catch(err) {
      handleError(err);
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
          sendOrderBook(true);
        } else {
          appWindow.send('orderDone', 'failed');
        }
      })
      .catch(err => {
        appWindow.send('orderDone', 'server error');
        displayError(err);
      });
  });

  ipcMain.on('takeOrder', (e, data) => {
    sn.dxTakeOrder(data.id, data.sendAddress, data.receiveAddress)
      .then(res => {
        if(res.id) { // success
          appWindow.send('orderDone', 'success');
          sendOrderBook(true);
          sendOrderHistory('', true);
        } else {
          appWindow.send('orderDone', 'failed');
        }
      })
      .catch(err => {
        appWindow.send('orderDone', 'server error');
        displayError(err);
      });
  });

  const stdInterval = 5000;

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

  const calculateBackupTotal = (price, size) => math.round(math.multiply(math.bignumber(price), math.bignumber(size)), 6).toNumber().toFixed(6);

  const sendOrderBook = async function(force) {
    if (isTokenPairValid(keyPair)) {
      try {
        const res = await sn.dxGetOrderBook3(keyPair[0], keyPair[1], 250);
        if(force === true || JSON.stringify(res) !== JSON.stringify(orderBook)) {
          orderBook = res;
          const allOrders = await getOrders();
          const orderTotals = new Map(allOrders.map(({ id, makerSize, takerSize }) => [id, [makerSize, takerSize]]));
          const orderBookWithTotals = Object.assign({}, res, {
            asks: res.asks.map(a => {
              const order = orderTotals.get(a.orderId);
              const total = !order ? calculateBackupTotal(a.price, a.size) : a.size === order[0] ? order[1] : order[0];
              return Object.assign({}, a, {total});
            }),
            bids: res.bids.map(b => {
              const order = orderTotals.get(b.orderId);
              const total = !order ? calculateBackupTotal(b.price, b.size) : b.size === order[0] ? order[1] : order[0];
              return Object.assign({}, b, {total});
            })
          });
          appWindow.send('orderBook', orderBookWithTotals);
        }
      } catch(err) {
        handleError(err);
      }
    }
  };
  ipcMain.on('getOrderBook', () => sendOrderBook(true));
  const sendOrderBookInterval = new RecursiveInterval();
  sendOrderBookInterval.set(sendOrderBook, stdInterval);

  tradeHistory = [];
  const sendTradeHistory = async function(force) {
    if (isTokenPairValid(keyPair)) {
      try {
        const res = await sn.dxGetOrderFills(keyPair[0], keyPair[1])
        if(force === true || JSON.stringify(res) !== JSON.stringify(tradeHistory)) {
          tradeHistory = res;
          appWindow.send('tradeHistory', tradeHistory, keyPair);
        }
      } catch(err) {
        handleError(err);
      }
    }
  };
  ipcMain.on('getTradeHistory', () => sendTradeHistory(true));
  const sendTradeHistoryInterval = new RecursiveInterval();
  sendTradeHistoryInterval.set(sendTradeHistory, stdInterval);

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
  const sendTokensInterval = new RecursiveInterval();
  sendTokensInterval.set(async function() {
    try {
      await sendNetworkTokens();
    } catch(err) {
      handleError(err);
    }
    try {
      await sendLocalTokens();
    } catch(err) {
      handleError(err);
    }
  }, 15000);

  myOrders = [];
  const sendMyOrders = async function(force) {
    try {
      const res = await sn.dxGetMyOrders();
      if(force === true || JSON.stringify(res) !== JSON.stringify(myOrders)) {
        myOrders = res;
        appWindow.send('myOrders', myOrders, keyPair);
      }
    } catch(err) {
      handleError(err);
    }
  };
  ipcMain.on('getMyOrders', () => sendMyOrders(true));
  const sendMyOrdersInterval = new RecursiveInterval();
  sendMyOrdersInterval.set(sendMyOrders, stdInterval);

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
  const orderHistoryDict = new Map();

  const sendOrderHistory = async function(which = '', force = false) {
    if (!isTokenPairValid(keyPair)) // need valid token pair
      return;
    const key = orderKey(keyPair);
    const shouldUpdate = force || !orderHistoryDict.has(key) ||
      (moment.utc().diff(orderHistoryDict.get(key)['orderHistoryLastUpdate'], 'seconds', true) >= 15);
    if (!shouldUpdate) {
      if (orderHistoryDict.has(key) && which)
        appWindow.send(which, orderHistoryDict.get(key)[which]);
      return;
    }

    // Make sure storage has key
    if (!orderHistoryDict.has(key))
      orderHistoryDict.set(key, {
        'orderHistory': [],
        'orderHistoryByMinute': [],
        'orderHistoryBy15Minutes': [],
        'orderHistoryBy1Hour': [],
        'currentPrice': { time: moment.utc().toISOString(), open: 0, close: 0, high: 0, low: 0, volume: 0 },
        'orderHistoryLastUpdate': moment.utc()
      });
    else
      orderHistoryDict.get(key)['orderHistoryLastUpdate'] = moment.utc();

    const end = moment().utc();
    const start = end.clone().subtract(1, 'day');

    try {
      const res = await sn.dxGetOrderHistory(keyPair[0], keyPair[1], start.unix(), end.unix(), 60);
      Object.assign(orderHistoryDict.get(key), {
        orderHistory: res,
        orderHistoryByMinute: res,
        currentPrice: calculatePricingData(res)
      });
      if (key === orderKey(keyPair)) {
        appWindow.send('orderHistory', res);
        appWindow.send('orderHistoryByMinute', res);
        appWindow.send('currentPrice', orderHistoryDict.get(key)['currentPrice']);
      }
    } catch(err) {
      handleError(err);
    }
    try {
      const res = await sn.dxGetOrderHistory(keyPair[0], keyPair[1], start.unix(), end.unix(), 900);
      orderHistoryDict.get(key)['orderHistoryBy15Minutes'] = res;
      if (key === orderKey(keyPair))
        appWindow.send('orderHistoryBy15Minutes', res);
    } catch(err) {
      handleError(err);
    }
    try {
      const res = await sn.dxGetOrderHistory(keyPair[0], keyPair[1], start.unix(), end.unix(), 3600);
      orderHistoryDict.get(key)['orderHistoryBy1Hour'] = res;
      if (key === orderKey(keyPair))
        appWindow.send('orderHistoryBy1Hour', res);
    } catch(err) {
      handleError(err);
    }
  };

  ipcMain.on('getOrderHistory', () => sendOrderHistory('orderHistory'));
  ipcMain.on('getOrderHistoryByMinute', () => sendOrderHistory('orderHistoryByMinute'));
  ipcMain.on('getOrderHistoryBy15Minutes', () => sendOrderHistory('orderHistoryBy15Minutes'));
  ipcMain.on('getOrderHistoryBy1Hour', () => sendOrderHistory('orderHistoryBy1Hour'));
  ipcMain.on('getCurrentPrice', () => sendOrderHistory('currentPrice'));

  const sendOrderHistoryInterval = new RecursiveInterval();
  sendOrderHistoryInterval.set(sendOrderHistory, 30000);

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
      displayError(err);
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
      .catch(displayError);
  });

  let balances = [];
  const sendBalances = async function(force) {
    try {
      const data = await sn.dxGetTokenBalances();
      if(force === true || JSON.stringify(data) !== JSON.stringify(balances)) {
        balances = data;
        appWindow.send('balances', balances);
      }
    } catch(err) {
      handleError(err);
    }
  };
  ipcMain.on('getBalances', () => sendBalances(true));
  const sendBalancesInterval = new RecursiveInterval();
  sendBalancesInterval.set(sendBalances, 12000);

  ipcMain.on('refreshBalances', async function() {
    try {
      await loadXBridgeConf();
      await sendNetworkTokens();
      await sendLocalTokens();
      await sendBalances(true);
    } catch(err) {
      handleError(err);
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
    pricingInterval.clear();
  };
  setPricingInterval = () => {
    pricingInterval = new RecursiveInterval();
    pricingInterval.set(async function() {
      if (isTokenPairValid(keyPair))
        await sendPricingMultipliers();
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
      storage.setItem('pricingEnabled', true);
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

  ipcMain.on('flushCancelledOrders', async function() {
    await sn.dxFlushCancelledOrders();
    sendMyOrders(true);
  });

};

MainSwitch.register('openUnverifiedAssetWindow', async function(tokens) {
  const doNotShowAgain = await openUnverifiedAssetWindow(tokens, platform, appWindow, storage);
  return doNotShowAgain;
});

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

const xBridgeConfExists = () => {
  try {
    const confPath = getCustomXbridgeConfPath();
    return fs.existsSync(confPath);
  } catch(err) {
    return false;
  }
};

const getSplitXBridgeConf = () => {
  if(!xBridgeConfExists()) return [];
  const confPath = getCustomXbridgeConfPath();
  const contents = fs.readFileSync(confPath, 'utf8').trim();
  if(!contents) return [];
  return contents
    .split(/\r?\n/g)
    .map(l => l.trim());
};

ipcMain.on('xBridgeConfExists', e => {
  e.returnValue = getSplitXBridgeConf().length > 0;
});

const saveShowAllOrders = showAllOrders => {
  let split = getSplitXBridgeConf();
  let idx = split.findIndex(l => /^ShowAllOrders=/.test(l));
  const newValue = `ShowAllOrders=${showAllOrders ? 'true' : 'false'}`;
  if(idx < 0) {
    const mainIdx = split.findIndex(l => /^\[Main]/.test(l));
    idx = mainIdx + 1;
    split = [
      ...split.slice(0, idx),
      newValue,
      ...split.slice(idx)
    ];
  } else {
    split = [
      ...split.slice(0, idx),
      newValue,
      ...split.slice(idx + 1)
    ];
  }
  const newContents = split.join('\n');
  fs.writeFileSync(getCustomXbridgeConfPath(), newContents, 'utf8');
};

ipcMain.on('saveGeneralSettings', async function(e, s) {
  const changed = {};
  if(enablePricing !== s.pricingEnabled) {
    enablePricing = s.pricingEnabled;
    changed.pricingEnabled = enablePricing;
  }
  if(pricingSource !== s.pricingSource) {
    pricingSource = s.pricingSource;
    changed.pricingSource = pricingSource;
  }
  if(apiKeys !== s.apiKeys) {
    apiKeys = s.apiKeys;
    changed.apiKeys = apiKeys;
  }
  if(pricingUnit !== s.pricingUnit) {
    pricingUnit = s.pricingUnit;
    changed.pricingUnit = pricingUnit;
  }
  if(pricingFrequency !== s.pricingFrequency) {
    pricingFrequency = s.pricingFrequency;
    changed.pricingFrequency = pricingFrequency;
  }
  if(storage.getItem('showAllOrders') !== s.showAllOrders) {
    changed.showAllOrders = s.showAllOrders;
    saveShowAllOrders(s.showAllOrders);
  }
  if(showWallet !== s.showWallet) {
    showWallet = s.showWallet;
    changed.showWallet = showWallet;
  }
  if(getAutofillAddresses() !== s.autofillAddresses) {
    changed.autofillAddresses = s.autofillAddresses;
  }
  const changedKeys = Object.keys(changed);
  if(['enablePricing', 'pricingSource', 'apiKeys', 'pricingUnit', 'pricingFrequency'].some(prop => changedKeys.includes(prop))) {
    clearPricingInterval();
    sendPricingMultipliers();
    setPricingInterval();
    sendMarketPricingEnabled();
  }
  storage.setItems(changed, true);
  if(changedKeys.includes('showAllOrders')) {
    loadXBridgeConf();
  }
  if(['showWallet', 'showAllOrders'].some(prop => Object.keys(changed).includes(prop))) {
    sendGeneralSettings();
  }
});

const sendGeneralSettings = () => {
  appWindow.send('generalSettings', {
    showWallet,
    showAllOrders: storage.getItem('showAllOrders')
  });
};
ipcMain.on('getGeneralSettings', e => {
  e.returnValue = {
    showWallet,
    showAllOrders: storage.getItem('showAllOrders')
  };
});

const loadXBridgeConf = async function() {
  await sn.dxLoadXBridgeConf();
};

ipcMain.on('loadXBridgeConf', async function() {
  try {
    await loadXBridgeConf();
  } catch(err) {
    handleError(err);
  }
});

ipcMain.on('setUserLocale', (e, locale) => {
  storage.setItem('locale', locale, true);
  app.relaunch();
  app.quit();
});

const getUserLocale = () => storage.getItem('locale');
ipcMain.on('getUserLocale', e => {
  e.returnValue = getUserLocale();
});

const getAutofillAddresses = () => storage.getItem('autofillAddresses') || false;
ipcMain.on('getAutofillAddresses', e => {
  e.returnValue = getAutofillAddresses();
});

const getLocaleData = () => {
  const locale = storage.getItem('locale');
  const localesPath = path.join(__dirname, 'locales');
  const files = fs.readdirSync(localesPath);
  const localeFileName = `${locale}.json`;
  let data;
  if(files.includes(localeFileName)) {
    data = fs.readJsonSync(path.join(localesPath, localeFileName));
  } else {
    data = fs.readJsonSync(path.join(localesPath, `${defaultLocale}.json`));
  }
  return data;
};

const getLocalizedTextBlock = textBlockName => {
  const fileName = `${textBlockName}-${getUserLocale()}.md`;
  const defaultFileName = `${textBlockName}-${defaultLocale}.md`;
  let filePath = path.join(__dirname, 'markdown', fileName);
  if(!fileExists(filePath)) filePath = path.join(__dirname, 'markdown', defaultFileName);
  return fs.readFileSync(filePath, 'utf8');
};
ipcMain.on('getLocalizedTextBlock', (e, textBlockName) => {
  try {
    e.returnValue = getLocalizedTextBlock(textBlockName);
  } catch(err) {
    e.returnValue = err.message;
  }
});

ipcMain.on('getLocaleData', e => {
  e.returnValue = getLocaleData();
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

const localeData = {};
const debugging = false;
ipcMain.on('localizeText', (e, key, context, replacers = {}) => {
  try {
    let text = localeData[key] && localeData[key][context] ? localeData[key][context].val : key;
    const replacerKeys = Object.keys(replacers);
    if(replacerKeys.length > 0) {
      for(const replacer of Object.keys(replacers)) {
        const val = replacers[replacer];
        const patt = new RegExp(_.escapeRegExp('{' + replacer + '}'), 'g');
        text = text.replace(patt, val);
      }
    }
    if(debugging) {
      e.returnValue = '***' + text + '***';
    } else {
      e.returnValue = text;
    }
  } catch(err) {
    handleError(err);
  }
});

const autoGenerateAddressesAvailable = () => {
  return info.version >= 3140100 ? true : false;
};
ipcMain.on('autoGenerateAddressesAvailable', e => {
  e.returnValue = autoGenerateAddressesAvailable();
});

const onReady = new Promise(resolve => app.on('ready', resolve));

ipcMain.on('generateNewAddress', async function(e, token) {
  try {
    const addresses = storage.getItem('addresses') || {};
    const newAddress = await sn.dxGetNewTokenAddress(token);
    const newAddresses = Object.assign({}, addresses, {
      [token]: newAddress
    });
    storage.setItem('addresses', newAddresses);
    appWindow.send('updatedAddresses', newAddresses);
  } catch(err) {
    handleError(err);
  }
});

const generateNewAddresses = async function() {
  try {
    const selectedWallets = storage.getItem('selectedWallets');
    const addresses = {};
    const manifest = getManifest()
      .reduce((map, w) => map.set(w.ver_id, w.ticker), new Map());
    for(const versionId of selectedWallets) {
      try {
        const token = manifest.get(versionId);
        const address = await sn.dxGetNewTokenAddress(token);
        if(address) addresses[token] = address;
      } catch(err) {
        // silently handle errors
        handleError(err);
      }
    }
    storage.setItem('addresses', addresses);
    return addresses;
  } catch(err) {
    handleError(err);
  }
};
ipcMain.on('generateNewAddresses', async function(e) {
  const addresses = await generateNewAddresses();
  appWindow.send('updatedAddresses', addresses);
});

ipcMain.on('setZoomFactor', (e, zoomFactor) => storage.setItem('zoomFactor', zoomFactor));
ipcMain.on('getZoomFactor', (e) => e.returnValue = storage.getItem('zoomFactor'));

ipcMain.on(ipcMainListeners.GET_HIDE_REFUND_NOTIFICATION, e => {
  const hideRefundNotification = storage.getItem('hideRefundNotification') || false;
  e.returnValue = hideRefundNotification;
});

ipcMain.on(ipcMainListeners.OPEN_REFUND_NOTIFICATION, async function(e, { title, message }) {
  try {
    const notShowAgain = await openMessageBox(title, message, appWindow, storage);
    storage.setItem('hideRefundNotification', notShowAgain);
  } catch(err) {
    displayError(err);
  }
});

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

    logger.initialize(dataPath);

    metaPath = path.join(dataPath, 'app-meta.json');
    storage = new SimpleStorage(metaPath);
    user = storage.getItem('user');
    password = storage.getItem('password');
    port = storage.getItem('port');
    let ip = storage.getItem('blocknetIP');

    let locale = storage.getItem('locale');
    if(!locale) {
      locale = 'en';
      storage.setItem('locale', defaultLocale);
    }

    const zoomFactor = storage.getItem('zoomFactor');
    if(!zoomFactor) storage.setItem('zoomFactor', 1);

    Localize.initialize(locale, getLocaleData());

    pricingSource = storage.getItem('pricingSource');
    if(!pricingSource) {
      pricingSource = pricingSources.CLOUD_CHAINS;
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
      enablePricing = true;
      storage.setItem('pricingEnabled', enablePricing);
    }
    showWallet = storage.getItem('showWallet');
    if(!showWallet && showWallet !== false) {
      showWallet = false;
      storage.setItem('showWallet', showWallet);
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
        handleError(err);
      }
    }

    const upgradedToV4 = storage.getItem('upgradedToV4');

    if(!user || !password) {
      if(!upgradedToV4) storage.setItem('upgradedToV4', true, true);
      await onReady;
      openConfigurationWindow({isFirstRun: true});
      checkForUpdates();
      return;
    }

    sn = new ServiceNodeInterface(user, password, `http://${ip}:${port}`);

    await new Promise(resolve => setTimeout(resolve, 2000));

    let infoErr;
    try {
      info = await sn.getinfo();
    } catch(err) {
      infoErr = err;
    }

    if(info) {

      if(info.version < 4000000) storage.setItem('upgradedToV4', false, true);

      // version check
      const versionErr = versionCheck(info.version);
      if(versionErr) {
        await electron.dialog.showMessageBox({
          type: 'info',
          title: versionErr.name,
          message: versionErr.message,
          buttons: [
            Localize.text('OK', 'universal')
          ]
        });
        return app.quit();
      }
    }

    if(!upgradedToV4) storage.setItem('upgradedToV4', true, true);

    if(infoErr && !upgradedToV4) await checkAndCopyV3Configs(getBaseDataPath(), app, Localize, storage);

    if(infoErr) {
      await onReady;
      checkForUpdates();
      openConfigurationWindow({ error: infoErr });
      return;
    }

    // Check ShowAllOrders
    {
      const showAllOrders = getShowAllOrdersFromXbridgeConf();
      if(showAllOrders === true) {
        storage.setItem('showAllOrders', true);
      } else {
        storage.setItem('showAllOrders', false);
      }
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

    // Autogenerate new addresses
    if(autoGenerateAddressesAvailable() && storage.getItem('autofillAddresses')) {
      await generateNewAddresses();
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
    electron.dialog.showErrorBox(Localize.text('Oops! There was an error.', 'universal'), err.message + '\n' + err.stack);
    app.quit();
  }

})();

function isTokenPairValid(keyPair) {
  return keyPair && keyPair.length === 2
    && !_.isNil(keyPair[0]) && !_.isNil(keyPair[1])
    && !_.isEmpty(keyPair[0]) && !_.isEmpty(keyPair[1]);
}

// check for version number. Minimum supported blocknet client version
function versionCheck(version) {
  if (version < 4030100) {
    const requiredVersion = '4.3.1';
    return {
      name: Localize.text('Unsupported Version', 'universal'),
      message: Localize.text('Block DX requires Blocknet wallet version {requiredVersion} or greater.', 'universal', {requiredVersion})
    };
  }
  return null;
}
