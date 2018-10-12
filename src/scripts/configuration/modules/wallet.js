const fs = require('fs-extra-promise');
const path = require('path');
const { ipcRenderer } = require('electron');
const uuid = require('uuid');
const { splitConf, mergeWrite } = require('./util');

const fileExists = p => {
  try {
    fs.statSync(p);
    return true;
  } catch(err) {
    return false;
  }
};

const { platform } = process;

class Wallet {

  constructor(w = {}) {

    const { versions = [] } = w;

    this.name = w.blockchain || '';
    this.abbr = w.ticker || '';
    this.versionId = w.ver_id || '';
    this.versionName = w.ver_name || '';
    this.dirNameLinux = w.dir_name_linux || '';
    this.dirNameMac = w.dir_name_mac || '';
    this.dirNameWin = w.dir_name_win || '';
    this.repoURL = w.repo_url || '';
    this.versions = versions;
    this.xBridgeConf = w.xbridge_conf || '';
    this.walletConf = w.wallet_conf || '';
    this.confName = w.conf_name || '';

    this.error = false;
    this.username = '';
    this.password = '';
    this.port = '';
    this.version = versions.length > 0 ? versions[versions.length - 1] : '';
    this.directory = '';

  }

  set(arg1, arg2) {
    const wallet = Object.assign({}, this);
    if(typeof arg1 === 'string') {
      wallet[arg1] = arg2;
    } else if(typeof arg1 === 'object') {
      const keys = Object.keys(arg1);
      for(const key of keys) {
        wallet[key] = arg1[key];
      }
    } else {
      throw new Error('You must pass in either a string or an object as the first argument to the set() method.');
    }
    return Object.assign(new Wallet(), wallet);
  }

  generateCredentials() {
    const { name } = this;
    const username = 'BlockDX' + name.replace(/\s/g, '');
    const password = uuid.v4();
    return { username, password };
  }

  getDefaultDirectory() {
    const folder = platform === 'win32' ? this.dirNameWin : platform === 'darwin' ? this.dirNameMac : '.' + this.dirNameMac.toLowerCase();
    const basePath = (platform === 'win32' || platform === 'darwin') ? ipcRenderer.sendSync('getDataPath') : ipcRenderer.sendSync('getHomePath');
    return path.join(basePath, folder);
  }

  saveWalletConf() {
    const { directory } = this;
    const conf = this.walletConf.replace(/--.*$/, '') + '.conf';
    const filePath = path.join(directory, conf);
    fs.ensureFileSync(filePath);
    const defaultFile = filePath + '-default';
    if(!fileExists(defaultFile)) fs.copySync(filePath, defaultFile);
    const baseConfStr = ipcRenderer.sendSync('getBaseConf', this.walletConf);
    const baseConf = splitConf(baseConfStr);
    const newContents = Object.assign({}, baseConf, {
      rpcuser: this.username,
      rpcpassword: this.password
    });
    mergeWrite(filePath, newContents);
    return newContents;
  }

}

module.exports = Wallet;
