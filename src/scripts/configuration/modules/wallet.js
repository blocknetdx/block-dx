const uuid = require('uuid');

class Wallet {

  constructor(w = {}) {

    const { versions = [] } = w;

    this.name = w.coin_name || '';
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

    this.error = false;
    this.username = '';
    this.password = '';
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

}

module.exports = Wallet;
