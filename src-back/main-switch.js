const { ipcMain } = require('electron');

// In order to make this feature extensible, we allow for different types of events (e.g. REGULAR or MULTITHREADED, etc.)
// The shared event key identifies the type of call being made as the render switch and main switch communicate. In most
// cases there would be a shared constants file which both the main and render switch modules would import, but because
// the Block DX front end is built in Angular it makes it difficult to share code that way.
const switchEventKeys = {
  REGULAR: 'aaaafdc5-9186-4aff-8731-52159ff92d85'
};

class MainSwitch {

  constructor() {
    this._funcs = new Map();
    this._windows = new Set();
    ipcMain.on(switchEventKeys.REGULAR, this.runFunc.bind(this));
  }

  async runFunc(e, id,  key, params) {
    try {
      const func = this._funcs.get(key);
      if(!func) throw new Error(`Unknown key: ${key}`);
      const res = await func(params);
      e.sender.send(id, null, res);
    } catch({ message, fileName, lineNumber }) {
      e.sender.send(id, { message, fileName, lineNumber });
    }
  }

  register(key, func) {
    this._funcs.set(key, func);
  }

  cleanup() {
    [...this._windows].forEach(w => w.destroy());
  }

}

module.exports.MainSwitch = new MainSwitch();
