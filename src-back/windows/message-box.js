const isDev = require('electron-is-dev');
const path = require('path');
const { BrowserWindow } = require('../browser-window');
const { ipcMainListeners } = require('../constants');

const { platform } = process;

const openMessageBox = (title, message, appWindow, storage) => new Promise(resolve => new BrowserWindow({
  filePath: path.resolve(__dirname, '../../', isDev ? 'src' : 'dist', 'message-box.html'),
  // toggleDevTools: true,
  windowOptions: {
    width: 580,
    minWidth: 300,
    height: platform === 'win32' ? 480 : platform === 'darwin' ? 445 : 440,
    minHeight: 425,
    parent: appWindow,
    modal: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
    }
  },
  listeners: {
    [ipcMainListeners.GET_MESSAGE_BOX_TITLE]: function(ee) {
      ee.returnValue = title;
    },
    [ipcMainListeners.GET_MESSAGE_BOX_MESSAGE]: function(ee) {
      ee.returnValue = message;
    },
    [ipcMainListeners.SET_MESSAGE_BOX_NOT_SHOW_AGAIN]: function(ee, hide) {
      this.data.set('hide', hide);
    },
    [ipcMainListeners.CLOSE_MESSAGE_BOX]: function() {
      this.close();
    }
  },
  onBeforeLoad() {
    this._window.webContents.setZoomFactor(storage.getItem('zoomFactor'));
  },
  onClose() {
    const hide = this.data.get('hide') || false;
    resolve(hide);
  }
}));

module.exports.openMessageBox = openMessageBox;
