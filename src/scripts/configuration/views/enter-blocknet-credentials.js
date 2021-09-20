/* global swal, Localize */

const { ipcRenderer } = require('electron');
const { RouterView } = require('../../modules/router');
const route = require('../constants/routes');
const configurationTypes= require('../constants/configuration-types');
const titles = require('../modules/titles');
const defaults = require('../constants/default-values');
const footerButtons = require('../snippets/footer-buttons');
const sidebar = require('../snippets/sidebar');

class EnterBlocknetCredentials extends RouterView {

  constructor(options) {
    super(options);
  }

  render(state) {

    const { $target } = this;

    const configurationType = state.get('configurationType');

    const standaloneRPCSettingsUpdate = configurationType === configurationTypes.UPDATE_RPC_SETTINGS;

    let username, password;
    if(standaloneRPCSettingsUpdate) {
      username = state.get('username');
      password = state.get('password');
      state.set('rpcPort', ipcRenderer.sendSync('getPort'));
      state.set('rpcIP', ipcRenderer.sendSync('getBlocknetIP'));
    } else {
      const block = state.get('wallets').find(w => w.abbr === 'BLOCK');
      username = block.username;
      password = block.password;
    }

    const styles = {
      p: 'margin-top:0;padding-top:0;padding-left:10px;padding-right:10px;margin-bottom:20px;',
      mainArea: 'margin-top:-10px;padding-top:0;background-color:#0e2742;overflow-y:auto;'
    };

    const col1 = standaloneRPCSettingsUpdate ? '' : `
      <div class="col1">
        ${sidebar(1)}
      </div>
    `;

    const html = `
          <h3>${standaloneRPCSettingsUpdate ? titles.RPC_SETTINGS() : titles.FRESH_SETUP_EXPERT_CONFIGURATION()}</h3>
          <div class="container">
            <div class="flex-container">
              ${col1}
              <div class="${standaloneRPCSettingsUpdate ? 'col2-no-margin' : 'col2'}">

                <p style="${styles.p}">${Localize.text('In order to conduct peer-to-peer trades, Block DX requires access to the <a href="#" class="text-link js-blocknetWalletLink">Blocknet wallet</a>. Please enter the RPC credentials found in <em>blocknet.conf</em>.','configurationWindowBlocknetCredentials')}</p>
                <div class="main-area" style="${styles.mainArea}">
                  <div class="input-group">
                    <label>${Localize.text('Blocknet RPC Port','configurationWindowBlocknetCredentials')}</label>
                    <input id="js-rpcPort" type="text" value="${state.get('rpcPort')}" />
                  </div>
                  <div class="input-group">
                    <label>${Localize.text('Blocknet RPC User','configurationWindowBlocknetCredentials')}</label>
                    <input id="js-rpcUser" type="text" value="${username}" />
                  </div>
                  <div class="input-group">
                    <label>${Localize.text('Blocknet RPC Password','configurationWindowBlocknetCredentials')}</label>
                    <input id="js-rpcPassword" type="text" value="${password}" />
                  </div>
                  <div class="input-group">
                    <label>${Localize.text('Blocknet IP','configurationWindowBlocknetCredentials')}</label>
                    <input id="js-rpcIP" type="text" value="${state.get('rpcIP')}" />
                  </div>
                </div>

                ${footerButtons()}

              </div>
            </div>
          </div>
        `;
    $target.html(html);
  }

  onMount(state, router) {
    const { $ } = this;
    const configurationType = state.get('configurationType');

    $('#js-backBtn').on('click', e => {
      e.preventDefault();
      if(configurationType === configurationTypes.UPDATE_RPC_SETTINGS) {
        state.set('username', ipcRenderer.sendSync('getUser'));
        state.set('password', ipcRenderer.sendSync('getPassword'));
        state.set('rpcPort', defaults.PORT);
        state.set('rpcIP', defaults.IP);
        router.goTo(route.CONFIGURATION_MENU);
      } else {
        const skipSetup = state.get('skipSetup');
        if(skipSetup) {
          router.goTo(route.SELECT_WALLETS);
        } else {
          router.goTo(route.ENTER_WALLET_CREDENTIALS);
        }
      }
    });

    $('#js-continueBtn').on('click', async function(e) {
      e.preventDefault();

      if(configurationType !== configurationTypes.UPDATE_RPC_SETTINGS) {
        const wallets = state.get('wallets');
        const block = wallets
          .find(w => w.abbr === 'BLOCK');
        const { username, password } = block;

        if(!username || !password) {
          await swal({
            title: Localize.text('Missing Credentials','configurationWindowBlocknetCredentials'),
            text: Localize.text('You must enter credentials for {name} in order to continue.','configurationWindowBlocknetCredentials',{name: block.name}),
            type: 'error',
            showConfirmButton: true,
            confirmButtonText: Localize.text('OK','configurationWindowBlocknetCredentials')
          });
          return;
        }

        const port = state.get('rpcPort');
        const rpcIP = state.get('rpcIP');
        ipcRenderer.sendSync('saveDXData', username, password, port, rpcIP);
        ipcRenderer.sendSync('saveSelected', [...state.get('selectedWallets')]);

      }
      router.goTo(route.FINISH);
    });

    $('#js-rpcPort').on('change', e => {
      const value = e.target.value.trim();
      state.set('rpcPort', value);
    });

    $('#js-rpcIP').on('change', e => {
      const value = e.target.value.trim();
      state.set('rpcIP', value);
    });

    $('#js-rpcUser').on('change', e => {
      const { value } = e.target;
      if(configurationType === configurationTypes.UPDATE_RPC_SETTINGS) {
        state.set('username', value.trim());
      } else {
        const wallets = state.get('wallets');
        const idx = wallets.findIndex(w => w.abbr === 'BLOCK');
        const newWallets = [
          ...wallets.slice(0, idx),
          wallets[idx].set({username: value.trim()}),
          ...wallets.slice(idx + 1)
        ];
        state.set('wallets', newWallets);
      }
    });

    $('#js-rpcPassword').on('change', e => {
      const { value } = e.target;
      if(configurationType === configurationTypes.UPDATE_RPC_SETTINGS) {
        state.set('password', value);
      } else {
        const wallets = state.get('wallets');
        const idx = wallets.findIndex(w => w.abbr === 'BLOCK');
        const newWallets = [
          ...wallets.slice(0, idx),
          wallets[idx].set({password: value}),
          ...wallets.slice(idx + 1)
        ];
        state.set('wallets', newWallets);
      }
    });

    $('.js-blocknetWalletLink').on('click', e => {
      e.preventDefault();
      ipcRenderer.send('openExternal', 'https://github.com/blocknetdx/blocknet/releases/latest');
    });

  }

}

module.exports = EnterBlocknetCredentials;
