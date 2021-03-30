/* global Localize */

const { ipcRenderer } = require('electron');
const { RouterView } = require('../../modules/router');
const configurationTypes = require('../constants/configuration-types');

class ConfigurationComplete extends RouterView {

  constructor(options) {
    super(options);
  }

  render(state) {

    const { $target } = this;

    const configurationType = state.get('configurationType');
    const addingWallets = configurationType === configurationTypes.ADD_NEW_WALLETS;
    const updatingWallets = configurationType === configurationTypes.UPDATE_WALLETS;

    const styles = {
      p: 'margin-top:0;padding-top:0;padding-left:10px;padding-right:10px;margin-bottom:5px;',
      mainArea: ''
    };

    const html = `
          <h3>${Localize.text('Configuration Complete!', 'configurationWindowComplete').toUpperCase()}</h3>
          <div class="container">
            <div class="flex-container">
              <!--div class="col1">
              </div-->
              <div class="col2-no-margin">
                ${addingWallets ?
                  `
                    <p style="${styles.p}">${Localize.text('Before Block DX can be used, these last few steps must be completed:','configurationWindowComplete')}</p>
                    <p style="${styles.p}"><strong style="margin-right: 10px;">1)</strong> ${Localize.text('The wallets for each of the newly added assets must be restarted to load the new configurations. Make sure that the wallets have been encrypted (Settings > Encrypt), synced, and are fully unlocked (Settings > Unlock Wallet).','configurationWindowComplete')}</p>
                    <p style="${styles.p}"><strong style="margin-right: 10px;">2)</strong> ${Localize.text('Open, sync, and fully unlock the <a href="#" class="text-link js-blocknetWalletLink">Blocknet wallet</a>.','configurationWindowComplete')}</p>
                    <p style="${styles.p}"><strong style="margin-right: 10px;">3)</strong> ${Localize.text('Select RESTART to restart Block DX and begin trading.','configurationWindowComplete')}</p>
                  `
                : updatingWallets ?
                  `
                    <p style="${styles.p}">${Localize.text('Before the updated assets can be traded on Block DX, <strong>the wallets for each of the updated assets must be restarted</strong> to load the new configurations. This includes the Blocknet wallet if it was updated.','configurationWindowComplete')}</p>
                  `
                :
                  `
                    <p style="${styles.p}">${Localize.text('Before Block DX can be used, these last few steps must be completed:','configurationWindowComplete')}</p>
                    <p style="${styles.p}"><strong style="margin-right: 10px;">1)</strong> ${Localize.text('Open the wallets of any assets you\'ll be trading. If any are already open, you will need to restart them in order to activate the new configurations. Make sure that the wallets have been encrypted (Settings > Encrypt) and are fully unlocked (Settings > Unlock Wallet).','configurationWindowComplete')}</p>
                    <p style="${styles.p}"><strong style="margin-right: 10px;">2)</strong> ${Localize.text('Open the <a href="#" class="text-link js-blocknetWalletLink">Blocknet wallet</a>. If it is already open, you will need to restart it in order to activate the new configurations. Make sure that the wallet has been encrypted (Settings > Encrypt) and is fully unlocked (Settings > Unlock Wallet).','configurationWindowComplete')}</p>
                    <p style="${styles.p}"><strong style="margin-right: 10px;">3)</strong> ${Localize.text('Select RESTART to restart Block DX and begin trading.','configurationWindowComplete')}</p>
                  `
                }
                <div class="main-area" style="background-color:#0e2742;overflow-y:auto;"></div>
                <div id="js-buttonContainer" class="button-container">
                  <button id="js-backBtn" type="button" class="gray-button">${Localize.text('Close','configurationWindowComplete').toUpperCase()}</button>
                  <button id="js-continueBtn" type="button">${Localize.text('Restart','configurationWindowComplete').toUpperCase()}</button>
                </div>
              </div>
            </div>
          </div>
        `;

    $target.html(html);
  }

  onMount(state) {
    const { $ } = this;
    const configurationType = state.get('configurationType');
    const addingWallets = configurationType === configurationTypes.ADD_NEW_WALLETS;
    const updatingWallets = configurationType === configurationTypes.UPDATE_WALLETS;
    $('.js-blocknetWalletLink').on('click', e => {
      e.preventDefault();
      ipcRenderer.send('openExternal', 'https://github.com/blocknetdx/blocknet/releases/latest');
    });
    $('#js-backBtn').on('click', e => {
      e.preventDefault();
      if(addingWallets || updatingWallets) {
        ipcRenderer.send('loadXBridgeConf');
      }
      setTimeout(() => {
        ipcRenderer.send('quit');
      }, 500);
    });
    $('#js-continueBtn').on('click', e => {
      e.preventDefault();
      if(addingWallets || updatingWallets) {
        ipcRenderer.send('loadXBridgeConf');
      }
      setTimeout(() => {
        ipcRenderer.send('restart');
      }, 500);
    });
  }

}

module.exports = ConfigurationComplete;
