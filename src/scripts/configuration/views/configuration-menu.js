/* global Localize */

const { ipcRenderer } = require('electron');
const { RouterView } = require('../../modules/router');
const route = require('../constants/routes');
const configurationTypes = require('../constants/configuration-types');
const titles = require('../modules/titles');
const fs = require('fs-extra-promise');
const path = require('path');
const { getDefaultLitewalletConfigDirectory, handleError } = require('../util');

class ConfigurationMenu extends RouterView {

  constructor(options) {
    super(options);
  }

  render(state) {

    const { $target } = this;

    const configurationType = state.get('configurationType');

    const styles = {
      p: 'margin-top:0;padding-top:0;padding-left:10px;padding-right:10px;margin-bottom:20px;',
      flexContainer: 'display:flex;flex-direction:row;flex-wrap:no-wrap;justify-content:flex-start;',
      flexCol1: 'width: 30px;min-width:30px;',
      mainArea: 'margin-top:-10px;padding-top:0;background-color:#0e2742;overflow-y:auto;'
    };

    const items = [
      {
        title: Localize.text('XLite Setup', 'configurationWindowMenu'),
        text: Localize.text('Use this to configure <a class="text-link" href="https://xlitewallet.com" id="js-xliteLink">XLite</a> with BlockDX.', 'configurationWindowMenu'),
        value: configurationTypes.LITEWALLET_RPC_SETUP
      },
      {
        title: Localize.text('Add New Local Wallet(s)','configurationWindowMenu'),
        text: Localize.text('Use this to configure new local wallets for trading. Newly added wallets will need to be restarted before trading.','configurationWindowMenu'),
        value: configurationTypes.ADD_NEW_WALLETS
      },
      {
        title: Localize.text('Update Local Wallet(s)','configurationWindowMenu'),
        text: Localize.text('Use this to reconfigure existing local wallet(s). Updated wallets will need to be restarted before trading.','configurationWindowMenu'),
        value: configurationTypes.UPDATE_WALLETS
      },
      {
        title: Localize.text('Fresh Setup','configurationWindowMenu'),
        text: Localize.text('Use this to reconfigure all your local wallets. This will require all local wallets to be restarted before trading and will cancel any open and in-progress orders from these wallets.','configurationWindowMenu'),
        value: configurationTypes.FRESH_SETUP
      },
      {
        title: Localize.text('Update Blocknet RPC Settings','configurationWindowMenu'),
        text: Localize.text('Use this to update the RPC credentials, port, and IP for the Blocknet Core wallet. This will require the Blocknet Core wallet to be restarted, which will cancel any open and in-progress orders from these wallets.','configurationWindowMenu'),
        value: configurationTypes.UPDATE_RPC_SETTINGS
      },
    ];

    const options = items.map(i => {
      return `
        <div class="js-selectConfigurationType main-area-item" data-value="${i.value}" style="${styles.flexContainer}">
          <div style="${styles.flexCol1}">
            <i class="${configurationType === i.value ? 'fa' : 'far'} fa-circle radio-icon"></i>
          </div>
          <div>
            <div><strong>${i.title}</strong></div>
            <div>${i.text}</div>
          </div>
        </div>
      `;
    }).join('\n');

    const html = `
          <h3>${titles.CONFIGURATION_SETUP()}</h3>
          <div class="container" style="flex-grow:1;">
            <div class="flex-container">
              <div class="col2-no-margin">

                <p style="${styles.p}">${Localize.text('Please select which of the following you would like to do:','configurationWindowMenu')}</p>

                <div class="main-area" style="${styles.mainArea}">

                  ${options}

                </div>

                <div id="js-buttonContainer" class="button-container">
                  <button id="js-backBtn" type="button" class="gray-button">${Localize.text('Cancel', 'configurationWindowMenu').toUpperCase()}</button>
                  <button id="js-continueBtn" type="button">${Localize.text('Continue','configurationWindowMenu').toUpperCase()}</button>
                </div>

              </div>
            </div>
          </div>
        `;
    $target.html(html);
  }

  onMount(state, router) {
    const { $ } = this;

    $('#js-xliteLink').on('click', e => {
      e.preventDefault();
      e.stopPropagation();
      const href = $(e.currentTarget).attr('href');
      ipcRenderer.send('openExternal', href);
    });
    $('#js-backBtn').on('click', e => {
      e.preventDefault();
      ipcRenderer.send('configurationWindowCancel');
    });

    $('#js-continueBtn').on('click', async function(e) {
      try {
        e.preventDefault();
        state.set('lookForWallets', true);
        const configurationType = state.get('configurationType');
        switch(configurationType) {
          case configurationTypes.ADD_NEW_WALLETS:
            router.goTo(route.SELECT_SETUP_TYPE);
            break;
          case configurationTypes.UPDATE_WALLETS:
            router.goTo(route.SELECT_SETUP_TYPE);
            break;
          case configurationTypes.FRESH_SETUP:
            router.goTo(route.SELECT_SETUP_TYPE);
            break;
          case configurationTypes.LITEWALLET_RPC_SETUP: {
            let directory = state.get('litewalletConfigDirectory');
            if(!directory) {
              directory = await getDefaultLitewalletConfigDirectory();
              state.set('litewalletConfigDirectory', directory);
            }
            const dirExists = await fs.existsAsync(directory);
            const settingsDirExists = await fs.existsAsync(path.join(directory, 'settings'));
            if(dirExists && settingsDirExists) {
              // go right to wallet selection
              router.goTo(route.SELECT_WALLETS);
            } else { // no CloudChains directory found
              router.goTo(route.LITEWALLET_SELECT_CONFIG_DIRECTORY);
            }
            break;
          } case configurationTypes.UPDATE_RPC_SETTINGS:
            router.goTo(route.ENTER_BLOCKNET_CREDENTIALS);
            break;
        }
      } catch(err) {
        handleError(err);
      }
    });

    $('.js-selectConfigurationType').on('click', e => {
      e.preventDefault();
      const configurationType = $(e.currentTarget).attr('data-value');
      state.set('configurationType', configurationType);
      const $items = $('.js-selectConfigurationType');
      for(let i = 0; i < $items.length; i++) {
        const $item = $($items[i]);
        const $i = $item.find('i');
        if($item.attr('data-value') === configurationType) {
          $i.addClass('fa');
          $i.removeClass('far');
        } else {
          $i.addClass('far');
          $i.removeClass('fa');
        }
      }
    });
  }

}

module.exports = ConfigurationMenu;
