/* global swal */

const { ipcRenderer, remote } = require('electron');
const fs = require('fs-extra-promise');
const { RouterView } = require('../../modules/router');
const route = require('../constants/routes');
const configurationTypes = require('../constants/configuration-types');
const titles = require('../constants/titles');

class SelectSetupType extends RouterView {

  constructor(options) {
    super(options);
  }

  render(state) {

    const { $target } = this;

    const configurationType = state.get('configurationType');
    const quickSetup = state.get('quickSetup');
    const isFirstRun = state.get('isFirstRun');

    const styles = {
      p: 'margin-top:0;padding-top:0;padding-left:10px;padding-right:10px;margin-bottom:20px;',
      flexContainer: 'display:flex;flex-direction:row;flex-wrap:no-wrap;justify-content:flex-start;',
      flexCol1: 'width: 30px;',
      mainArea: 'margin-top:-10px;padding-top:0;background-color:#0e2742;overflow-y:auto;'
    };

    let title;
    if(configurationType === configurationTypes.ADD_NEW_WALLETS) {
      title = titles.ADD_WALLET;
    } else if(configurationType === configurationTypes.UPDATE_WALLETS) {
      title = titles.UPDATE_WALLET;
    } else if(configurationType === configurationTypes.FRESH_SETUP) {
      title = titles.FRESH_SETUP;
    } else {
      title = titles.RPC_SETTINGS;
    }

    const html = `
          <h3>${title}</h3>
          <div class="container">
            <div class="flex-container">
              <div class="col2-no-margin">
            
                <p style="${styles.p}">Block DX is the fastest, most secure, most reliable, and most decentralized exchange, allowing for peer-to-peer trading directly from your wallet.</p>
                <p style="${styles.p}"><strong>Prerequisites</strong>: Block DX requires the <a href="#" class="text-link js-blocknetWalletLink">latest Blocknet wallet</a> and the wallets of any assets you want to trade with. These must be downloaded and installed before continuing. See the full list of <a href="#" class="text-link js-compatibleWalletsLink">compatible assets and wallet versions</a>.</p>
                <div class="main-area" style="${styles.mainArea}">
                
                  <div id="js-automaticCredentials" class="main-area-item" style="${styles.flexContainer}">
                    <div style="${styles.flexCol1}">
                      <i class="${quickSetup ? 'fa' : 'far'} fa-circle radio-icon"></i> 
                    </div>
                    <div>
                      <div><strong>Quick Setup</strong> (recommended)</div>
                        ${configurationType === configurationTypes.UPDATE_WALLETS ?
                          '<div>This option reconfigures the wallets with the most up-to-date default settings. If using a custom data directory location, you must use Expert Setup.</div>'
                          :
                          '<div>This option automatically detects the wallets installed and simplifies the process to configure them for trading. If using a custom data directory location, you must use Expert Setup.</div>'
                        }
                      </div>
                    </div>
                  
                    <div id="js-manualCredentials" class="main-area-item" style="${styles.flexContainer}">
                      <div style="${styles.flexCol1}">
                        <i class="${!quickSetup ? 'fa' : 'far'} fa-circle radio-icon"></i> 
                      </div>
                    <div>
                      <div><strong>Expert Setup</strong> (advanced users only)</div>
                      <div>
                        ${configurationType === configurationTypes.UPDATE_WALLETS ?
                          '<div>This option allows you to specify the data directory locations and RPC credentials.</div>'
                        :
                          '<div>This option allows you to specify the data directory locations and RPC credentials.</div>'
                        }
                      </div>
                    </div>
                  </div>
                
                </div>
              
                <div id="js-buttonContainer" class="button-container">
                  <button id="js-backBtn" type="button" class="gray-button">${isFirstRun ? 'CANCEL' : 'BACK'}</button>
                  <button id="js-continueBtn" type="button">CONTINUE</button>
                </div>
              
              </div>
            </div>
          </div>
        `;
    $target.html(html);
  }

  onMount(state, router) {
    const { $ } = this;
    const toggleCredentialGeneration = (e, quickSetup = false) => {
      e.preventDefault();
      if(quickSetup !== state.get('quickSetup')) state.set('quickSetup', quickSetup);
      const $automatic = $('#js-automaticCredentials').find('i');
      const $manual = $('#js-manualCredentials').find('i');
      if(!quickSetup) {
        $automatic.addClass('far');
        $automatic.removeClass('fa');
        $manual.addClass('fa');
        $manual.removeClass('far');
      } else {
        $automatic.addClass('fa');
        $automatic.removeClass('far');
        $manual.addClass('far');
        $manual.removeClass('fa');
      }
    };
    $('.js-blocknetWalletLink').on('click', e => {
      e.preventDefault();
      remote.shell.openExternal('https://github.com/blocknetdx/blocknet/releases/latest');
    });
    $('.js-compatibleWalletsLink').on('click', e => {
      e.preventDefault();
      remote.shell.openExternal('https://docs.blocknet.co/blockdx/listings/#listed-digital-assets');
    });
    $('#js-automaticCredentials').on('click', e => toggleCredentialGeneration(e, true));
    $('#js-manualCredentials').on('click', e => toggleCredentialGeneration(e, false));
    $('#js-backBtn').on('click', e => {
      e.preventDefault();
      const isFirstRun = state.get('isFirstRun');
      if(isFirstRun) {
        ipcRenderer.send('configurationWindowCancel');
      } else {
        router.goTo(route.CONFIGURATION_MENU);
      }
    });
    $('#js-continueBtn').on('click', e => {
      e.preventDefault();
      const configurationType = state.get('configurationType');
      const wallets = state.get('wallets');
      if(state.get('quickSetup')) {
        const newWallets = wallets
          .map(w => {
            if(configurationType === configurationTypes.ADD_NEW_WALLETS && w.abbr === 'BLOCK') {
              // it will use custom Blocknet directory if one has been previously set, otherwise it will fall back to the default directory
              return w.set('directory', w.getCustomDirectory());
            } else {
              return w.set('directory', w.getDefaultDirectory());
            }
          });
        state.set('wallets', newWallets);
        const blocknetWallet = newWallets.find(w => w.abbr === 'BLOCK');
        const dir = blocknetWallet.directory;
        try {
          fs.statSync(dir);
          router.goTo(route.SELECT_WALLET_VERSIONS);
        } catch(err) {
          swal({
            text: 'An installation of the Blocknet wallet was not found, but is required to use Block DX. Please install the Blocknet wallet before continuing.',
            type: 'warning'
          });
        }
      } else {
        const newWallets = wallets
          .map(w => w.set('directory', w.getCustomDirectory()));
        state.set('wallets', newWallets);
        router.goTo(route.SELECT_WALLETS);
      }
    });
  }

}

module.exports = SelectSetupType;
