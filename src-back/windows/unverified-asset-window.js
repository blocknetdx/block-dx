const isDev = require('electron-is-dev');
const path = require('path');
const { BrowserWindow } = require('../browser-window');

const openUnverifiedAssetWindow = (tokens, platform, appWindow) => new Promise(resolve => new BrowserWindow({
  filePath: path.resolve(__dirname, '../../', isDev ? 'src' : 'dist', 'unverified-asset.html'),
  // toggleDevTools: true,
  windowOptions: {
    width: 580,
    height: platform === 'win32' ? 390 : platform === 'darwin' ? 380 : 360,
    parent: appWindow,
    webPreferences: {
      nodeIntegration: true
    }
  },
  listeners: {
    getUnverifiedAssets(ee) {
      ee.returnValue = tokens;
    },
    setHideAssetWarning(ee, hide) {
      this.data.set('hide', hide);
    },
    closeUnverifiedAssetWindow() {
      this.close();
    }
  },
  onClose() {
    const hide = this.data.get('hide') || false;
    resolve(hide);
  }
}));

module.exports.openUnverifiedAssetWindow = openUnverifiedAssetWindow;
