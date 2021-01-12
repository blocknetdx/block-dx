/* global swal */

const { ipcRenderer } = require('electron');
const fs = require('fs');
const path = require('path');
const { Set } = require('immutable');
const { Router } = require('../modules/router');
const route = require('./constants/routes');
const configurationTypes = require('./constants/configuration-types');
const defaults = require('./constants/default-values');
const SelectSetupType = require('./views/select-setup-type');
const SelectWalletVersions = require('./views/select-wallet-versions');
const ConfigurationComplete = require('./views/configuration-complete');
const SelectWallets = require('./views/select-wallets');
const ExpertSelectWalletVersions = require('./views/expert-select-wallet-versions');
const SelectWalletDirectories = require('./views/select-wallet-directories');
const ExpertSelectSetupType = require('./views/expert-select-setup-type');
const Finish = require('./views/finish');
const EnterBlocknetCredentials = require('./views/enter-blocknet-credentials');
const EnterWalletCredentials = require('./views/enter-wallet-credentials');
const ConfigurationMenu = require('./views/configuration-menu');
const SelectLitewalletConfigDirectory = require('./views/select-litewallet-config-directory');
const Wallet = require('./modules/wallet');
const { handleError } = require('./util');

const { Localize } = require('../../../src-back/localize');
Localize.initialize(ipcRenderer.sendSync('getUserLocale'), ipcRenderer.sendSync('getLocaleData'));
window.Localize = Localize;

ipcRenderer.on('errorMessage', async function(e, title, message) {
  try {
    const { dismiss } = await swal({
      title,
      html: message,
      type: 'warning',
      showConfirmButton: true,
      confirmButtonText: 'Start Configuration',
      showCancelButton: true,
      cancelButtonText: 'Restart',
      reverseButtons: true,
      allowEscapeKey: false,
      allowOutsideClick: false
    });
    if(dismiss === 'cancel') {
      ipcRenderer.send('restart');
    }
  } catch(err) {
    handleError(err);
    alert(err);
  }
});

const state = {

  _data: new Map(),

  set(key, val) {
    this._data.set(key, val);
    console.log('state', [...this._data.entries()]
      .reduce((obj, [ k, v ]) => Object.assign(obj, {[k]: v}), {})
    );
  },

  get(key) {
    return this._data.get(key);
  }

};

$(document).ready(() => {
  try {

    document.title = Localize.text('Configuration', 'configurationWindow');

    state.set('sidebarSelected', 0);
    state.set('sidebarItems', [
      {text: 'Configuration Setup'},
      {text: 'RPC Settings'}
    ]);
    state.set('skipSetup', false);
    state.set('active', 'configuration1');
    state.set('quickSetup', true);
    state.set('generateCredentials', true);
    state.set('rpcPort', defaults.PORT);
    state.set('rpcIP', defaults.IP);
    state.set('username', ipcRenderer.sendSync('getUser'));
    state.set('password', ipcRenderer.sendSync('getPassword'));
    state.set('litewalletConfigDirectory', ipcRenderer.sendSync('getLitewalletConfigDirectory'));

    const isFirstRun = ipcRenderer.sendSync('isFirstRun');
    state.set('isFirstRun', isFirstRun);

    state.set('configurationType', isFirstRun ? configurationTypes.FRESH_SETUP : configurationTypes.ADD_NEW_WALLETS);

    const router = new Router({
      $target: $('#js-main'),
      state
    });
    router.registerRoute(route.SELECT_SETUP_TYPE, SelectSetupType);
    router.registerRoute(route.SELECT_WALLET_VERSIONS, SelectWalletVersions);
    router.registerRoute(route.CONFIGURATION_COMPLETE, ConfigurationComplete);
    router.registerRoute(route.SELECT_WALLETS, SelectWallets);
    router.registerRoute(route.EXPERT_SELECT_WALLET_VERSIONS, ExpertSelectWalletVersions);
    router.registerRoute(route.SELECT_WALLET_DIRECTORIES, SelectWalletDirectories);
    router.registerRoute(route.EXPERT_SELECT_SETUP_TYPE, ExpertSelectSetupType);
    router.registerRoute(route.FINISH, Finish);
    router.registerRoute(route.ENTER_BLOCKNET_CREDENTIALS, EnterBlocknetCredentials);
    router.registerRoute(route.ENTER_WALLET_CREDENTIALS, EnterWalletCredentials);
    router.registerRoute(route.CONFIGURATION_MENU, ConfigurationMenu);
    router.registerRoute(route.LITEWALLET_SELECT_CONFIG_DIRECTORY, SelectLitewalletConfigDirectory);

    let wallets = ipcRenderer.sendSync('getManifest');
    wallets = wallets.map(w => new Wallet(w));
    const blockIdx = wallets.findIndex(w => w.abbr === 'BLOCK');
    const others = [
      ...wallets.slice(0, blockIdx),
      ...wallets.slice(blockIdx + 1)
    ].sort((a, b) => a.name.localeCompare(b.name));
    wallets = [
      wallets[blockIdx],
      ...others
    ];
    let selectedWalletIds = new Set([
      wallets[0].versionId,
      ...ipcRenderer.sendSync('getSelected')
    ]);

    let xbridgeConfPath = ipcRenderer.sendSync('getXbridgeConfPath');
    let xbridgeConf;
    try {
      if(!xbridgeConfPath) xbridgeConfPath = path.join(wallets.find(w => w.abbr === 'BLOCK').directory, 'xbridge.conf');
      xbridgeConf = fs.readFileSync(xbridgeConfPath, 'utf8');
    } catch(err) {
      handleError(err);
      xbridgeConf = '';
    }
    if(xbridgeConf) {
      try {
        const splitConf = xbridgeConf
          .split('\n')
          .map(s => s.trim())
          .filter(s => s ? true : false);
        const exchangeWallets = splitConf
          .find(s => /^ExchangeWallets\s*=/.test(s))
          .split('=')[1]
          .split(',')
          .map(s => s.trim())
          .filter(s => s ? true : false);
        const walletFromVersionId = wallets.reduce((map, w) => map.set(w.versionId, w), new Map());
        const abbrs = [];
        for(const versionId of [...selectedWalletIds]) {
          const w = walletFromVersionId.get(versionId);
          if(!w || !exchangeWallets.includes(w.abbr)) {
            selectedWalletIds = selectedWalletIds.remove(versionId);
          } else {
            abbrs.push(w.abbr);
          }
        }
        const toAdd = exchangeWallets
          .filter(abbr => !abbrs.includes(abbr));
        for(const abbr of toAdd) {
          const w = wallets.find(ww => ww.abbr === abbr);
          selectedWalletIds = selectedWalletIds.add(w.versionId);
        }
      } catch(err) {
        handleError(err);
      }

    }

    const selectedAbbrs = new Set([...wallets
      .filter(w => selectedWalletIds.has(w.versionId))
      .map(w => w.abbr)
    ]);
    state.set('selectedWallets', selectedWalletIds);
    state.set('selectedAbbrs', selectedAbbrs);
    state.set('addWallets', new Set());
    state.set('addAbbrs', new Set());
    state.set('addAbbrToVersion', new Map());
    state.set('updateWallets', new Set());
    state.set('updateAbbrs', new Set());
    state.set('updateAbbrToVersion', new Map());
    state.set('skipList', new Set());
    state.set('lookForWallets', true);

    state.set('wallets', wallets);

    if(isFirstRun) {
      router.goTo(route.SELECT_SETUP_TYPE);
    } else {
      router.goTo(route.CONFIGURATION_MENU);
    }

  } catch(err) {
    alert(err.message);
    handleError(err);
  }
});
