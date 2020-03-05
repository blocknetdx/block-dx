const { BrowserWindow: ElectronBrowserWindow, ipcMain } = require('electron');
const isDev  = require('electron-is-dev');

const throwFilePathError = () => {
  throw new Error('You must pass in a filePath parameter when creating a new BrowserWindow. e.g. "/home/users/myUser/myProject/myWindow.html"');
};

const allWindows = [];

class BrowserWindow {

  constructor({ filePath = throwFilePathError(), toggleDevTools = false, isMainWindow = false, windowOptions = {}, listeners = {}, onBeforeLoad, onLoad, onClose }) {

    this.data = new Map();
    this._listeners = new Map();

    const browserWindow = new ElectronBrowserWindow({
      show: false,
      webPreferences: {
        nodeIntegration: true
      },
      ...windowOptions
    });
    allWindows.push(this);
    this._window = browserWindow;
    this.send = (key, message) => browserWindow.send(key, message);
    this.windowId = this._window.id;
    this.isMainWindow = isMainWindow;

    //if(toggleDevTools && isDev) browserWindow.toggleDevTools();
    if(toggleDevTools) browserWindow.toggleDevTools();

    if (!isMainWindow) browserWindow.setMenu(null);

    if(onBeforeLoad) onBeforeLoad = onBeforeLoad.bind(this);
    if(onLoad) onLoad = onLoad.bind(this);
    if(onClose) onClose = onClose.bind(this);

    browserWindow.on('close', async function() {
      if(onClose) await onClose();

      // remove the window from our array of windows
      const winIdx = allWindows.findIndex(w => w.id = this.windowId);
      allWindows.splice(winIdx, 1);

      if (this.isMainWindow) BrowserWindow.closeAllWindows();
    }.bind(this));

    browserWindow.once('ready-to-show', async function() {
      if(onBeforeLoad) await onBeforeLoad();
      browserWindow.show();
      if(onLoad) await onLoad();
    }.bind(this));

    browserWindow.loadURL(`file://${filePath}`);

    browserWindow.on('closed', () => {
      for(const [event, listener] of [...this._listeners.entries()]) {
        ipcMain.removeListener(event, listener);
      }
      this._window = null;
    });

    for(const event of Object.keys(listeners)) {
      const userFunc = listeners[event].bind(this);
      const listener = async function(e, params) {
        if(e.sender === browserWindow.webContents) {
          await userFunc(e, params);
        }
      }.bind(this);
      ipcMain.on(event, listener);
      this._listeners.set(event, listener);
    }

  }

  async close() {
    try {
      if(this._window) this._window.close();
    } catch(err) {
      console.error(err);
    }
  }

  async show() {
    try {
      if(this._window) this._window.show();
    } catch(err) {
      console.error(err);
    }
  }
}
BrowserWindow.closeAllWindows = () => allWindows.forEach(w => w.close());

module.exports.BrowserWindow = BrowserWindow;
