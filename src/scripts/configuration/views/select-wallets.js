/* global Localize */

const { ipcRenderer, remote } = require('electron');
const { RouterView } = require('../../modules/router');
const route = require('../constants/routes');
const sidebar = require('../snippets/sidebar');
const configurationTypes = require('../constants/configuration-types');
const titles = require('../modules/titles');
const fs = require('fs-extra-promise');
const path = require('path');
const { Set } = require('immutable');
const { handleError, putConfs } = require('../util');
const request = require('superagent');

class SelectWallets extends RouterView {

  constructor(options) {
    super(options);
  }

  onBeforeMount(state) {
    const configurationType = state.get('configurationType');
    if(configurationType === configurationTypes.LITEWALLET_RPC_SETUP) {
      const cloudChainsDir = state.get('litewalletConfigDirectory');
      const settingsDir = path.join(cloudChainsDir, 'settings');
      const configFilePatt = /^config-(.+)\.json$/i;
      const wallets = state.get('wallets');
      const walletsMap = new Map(wallets.map(w => [w.abbr, w]));
      const litewallets = fs.readdirSync(settingsDir)
        .filter(f => configFilePatt.test(f))
        .map(f => {
          const filePath = path.join(settingsDir, f);
          try {
            const data = fs.readJsonSync(filePath);
            const matches = f.match(configFilePatt);
            const abbr = matches[1];
            const wallet = walletsMap.get(abbr);
            if(!wallet) return null;
            return Object.assign({}, data, {
              abbr,
              name: wallet.name,
              wallet,
              filePath
            });
          } catch(err) {
            return null;
          }
        })
        .filter(data => data);
      state.set('availableLitewallets', litewallets);
      state.set('selectedLitewallets', Set(litewallets.map(w => w.abbr)));
      // state.set('selectedLitewallets', Set(litewallets.filter(w => w.abbr !== 'BLOCK').map(w => w.abbr)));
    }
  }

  render(state) {

    const { $target } = this;

    const configurationType = state.get('configurationType');
    const addingWallets = configurationType === configurationTypes.ADD_NEW_WALLETS;
    const updatingWallets = configurationType === configurationTypes.UPDATE_WALLETS;
    const configuringLitewallets = configurationType === configurationTypes.LITEWALLET_RPC_SETUP;

    let allChecked = true;

    let selected, items;

    if(configuringLitewallets) {
      items = state.get('availableLitewallets');
      selected = state.get('selectedLitewallets');
    } else {
      selected = addingWallets ? state.get('addAbbrs') : updatingWallets ? state.get('updateAbbrs') : state.get('selectedAbbrs');
      items = state
        .get('wallets')
        .filter(w => addingWallets ? !state.get('selectedAbbrs').has(w.abbr) : updatingWallets ? state.get('selectedAbbrs').has(w.abbr) : true)
        .reduce((arr, w) => {
          return arr.some(ww => ww.abbr === w.abbr) ? arr : [...arr, w];
        }, []);

    }

    const listItems = items
      .map(i => {
        if(!configuringLitewallets && !updatingWallets && i.abbr === 'BLOCK') {
          return `<div class="main-area-item" style="cursor:default;opacity:1;"><i class="far fa-check-square radio-icon"></i> ${i.name} (${i.abbr})</div>`;
        } else {
          if(!selected.has(i.abbr)) allChecked = false;
          return `<div class="js-mainAreaItem main-area-item" data-id="${i.abbr}"><i class="far ${selected.has(i.abbr) ? 'fa-check-square' : 'fa-square'} radio-icon"></i> ${i.name} (${i.abbr})</div>`;
        }
      })
      .join('\n');

    const skip = state.get('skipSetup');

    let title;
    if(addingWallets) {
      title = titles.ADD_WALLET_EXPERT_CONFIGURATION();
    } else if(updatingWallets) {
      title = titles.UPDATE_WALLET_EXPERT_CONFIGURATION();
    } else if(configurationType === configurationTypes.LITEWALLET_RPC_SETUP) {
      title = titles.LITEWALLET_SELECT_WALLETS();
    } else {
      title = titles.FRESH_SETUP_EXPERT_CONFIGURATION();
    }

    const html = `
      <h3>${title}</h3>
      <div class="container">
        <div class="flex-container">
          ${configuringLitewallets ? '' : `<div class="col1">
            ${sidebar(0)}
          </div>`}
          <div class="${configuringLitewallets ? 'col2-no-margin' : 'col2'}">
            <p style="margin-top:0;padding-top:0;padding-left:10px;padding-right:10px;margin-bottom:10px;">${updatingWallets ? Localize.text('Select the wallet(s) that you would like to update.','configurationWindowWallets') : Localize.text('In order to conduct peer-to-peer trades, Block DX requires the <a href="#" class="text-link js-blocknetWalletLink">Blocknet wallet</a> and the wallets of any assets you want to trade with. Select the wallets that are installed to begin setup.','configurationWindowWallets')}</p>
            <p class="select-all-container"><a class="js-selectAll select-all-link" href="#"><i class="far ${allChecked ? 'fa-check-square' : 'fa-square'} check-icon" />${Localize.text(' Select All','configurationWindowWallets')}</a></p>
            <div id="js-mainConfigurationArea" class="main-area" style="position:relative;${skip ? 'opacity:.6;overflow-y:hidden;' : 'opacity:1;overflow-y:scroll;'}">
              ${listItems}
              <div id="js-overlay" style="display:${skip ? 'block' : 'none'};position:absolute;left:0;top:0;width:100%;height:100%;background-color:#000;opacity:0;"></div>
            </div>
            ${configuringLitewallets ? '' : `<div style="display:${(updatingWallets || addingWallets) ? 'none' : 'block'};padding: 10px; cursor: pointer;padding-bottom:0;">
              <div id="js-skip" class="main-area-item"><i class="far ${skip ? 'fa-check-square' : 'fa-square'} radio-icon"></i>${Localize.text(' Skip and setup Block DX manually (not recommended','configurationWindowWallets')})</div>
            </div>`}

            <div id="js-buttonContainer" class="button-container">
              <button id="js-backBtn" type="button" class="gray-button">${Localize.text('Back','configurationWindowWallets').toUpperCase()}</button>
              <button id="js-continueBtn" type="button" ${selected.size === 0 ? 'disabled' : ''}>${Localize.text('Finish','configurationWindowWallets').toUpperCase()}</button>
            </div>

          </div>
        </div>
      </div>
    `;
    $target.html(html);
  }

  onMount(state, router) {
    const { $ } = this;

    const toggleSelect = $target => {

      const $continueBtn = $('#js-continueBtn');

      const configurationType = state.get('configurationType');
      const addingWallets = configurationType === configurationTypes.ADD_NEW_WALLETS;
      const updatingWallets = configurationType === configurationTypes.UPDATE_WALLETS;
      const configuringLitewallets = configurationType === configurationTypes.LITEWALLET_RPC_SETUP;

      const abbr = $target.attr('data-id');
      const $icon = $target.find('i');
      const selectedListName = configuringLitewallets ? 'selectedLitewallets' : addingWallets ? 'addAbbrs' : updatingWallets ? 'updateAbbrs' : 'selectedAbbrs';
      let selectedAbbrs = state.get(selectedListName);
      if(selectedAbbrs.has(abbr)) { // it is checked
        $icon.addClass('fa-square');
        $icon.removeClass('fa-check-square');
        selectedAbbrs = selectedAbbrs.delete(abbr);
      } else { // it is not checked
        $icon.addClass('fa-check-square');
        $icon.removeClass('fa-square');
        selectedAbbrs = selectedAbbrs.add(abbr);
      }
      state.set(selectedListName, selectedAbbrs);
      if(selectedAbbrs.size === 0) {
        $continueBtn.prop('disabled', true);
      } else {
        $continueBtn.prop('disabled', false);
      }
    };

    $('.js-mainAreaItem')
      .off('click')
      .on('click', e => {
        e.preventDefault();
        const $target = $(e.currentTarget);
        toggleSelect($target);
        const $selectAllIcon = $('.js-selectAll').find('i');
        const configurationType = state.get('configurationType');
        if(configurationType === configurationTypes.LITEWALLET_RPC_SETUP) {
          if(state.get('availableLitewallets').length === state.get('selectedLitewallets').size) {
            $selectAllIcon.removeClass('fa-square');
            $selectAllIcon.addClass('fa-check-square');
          } else {
            $selectAllIcon.addClass('fa-square');
            $selectAllIcon.removeClass('fa-check-square');
          }
        } else {
          $selectAllIcon.addClass('fa-square');
          $selectAllIcon.removeClass('fa-check-square');
        }
      });

    $('.js-selectAll').on('click', e => {
      e.preventDefault();
      const $items = $('.js-mainAreaItem');
      const items = [];
      for(const item of $items) {
        const $item = $(item);
        const $icon = $item.find('i');
        const checked = $icon.hasClass('fa-check-square');
        const abbr = $item.attr('data-abbr');
        items.push({
          abbr,
          checked,
          $icon,
          $item
        });
      }
      const $selectAllIcon = $(e.currentTarget).find('i');
      const allChecked = $selectAllIcon.hasClass('fa-check-square');
      if(allChecked) { // de-select all
        $selectAllIcon.addClass('fa-square');
        $selectAllIcon.removeClass('fa-check-square');
        for(const item of items) {
          toggleSelect(item.$item);
        }
      } else { // select all
        $selectAllIcon.addClass('fa-check-square');
        $selectAllIcon.removeClass('fa-square');
        for(const item of items) {
          if(!item.checked) toggleSelect(item.$item);
        }
      }
    });

    $('#js-skip')
      .off('click')
      .on('click', e => {
        e.preventDefault();
        const skip = state.get('skipSetup');
        const $main = $('#js-mainConfigurationArea');
        const $overlay = $('#js-overlay');
        const $target = $(e.currentTarget).find('i');
        if(skip) { // it is checked
          $target.addClass('fa-square');
          $target.removeClass('fa-check-square');
          $main.css('overflow-y', 'scroll');
          $main.css('opacity', '1');
          state.set('skipSetup', false);
          $overlay.css('display', 'none');
        } else { // it is not checked
          $target.addClass('fa-check-square');
          $target.removeClass('fa-square');
          $main.css('opacity', '.3');
          $main.css('overflow-y', 'hidden');
          state.set('skipSetup', true);
          $overlay.css('display', 'block');
        }
      });

    $('#js-backBtn').on('click', e => {
      e.preventDefault();
      const configurationType = state.get('configurationType');
      if(configurationType === configurationTypes.LITEWALLET_RPC_SETUP) {
        router.goTo(route.CONFIGURATION_MENU);
      } else {
        router.goTo(route.SELECT_SETUP_TYPE);
      }
    });

    $('#js-continueBtn').on('click', async function(e) {
      e.preventDefault();
      const configurationType = state.get('configurationType');
      if(configurationType === configurationTypes.LITEWALLET_RPC_SETUP) {
        const availableLitewallets = state.get('availableLitewallets');
        const selectedLitewallets = state.get('selectedLitewallets');
        const walletsToSave = availableLitewallets
          .filter(w => selectedLitewallets.has(w.abbr));
        for(const litewallet of walletsToSave) {
          const { filePath } = litewallet;
          const config = fs.readJsonSync(filePath);
          const rpcPort = config.rpcPort || litewallet.rpcPort;
          let rpcUsername = config.rpcUsername || litewallet.rpcUsername;
          let rpcPassword = config.rpcPassword || litewallet.rpcPassword;
          if(!rpcUsername || !rpcPassword) {
            const { username, password } = litewallet.wallet.generateCredentials();
            rpcUsername = username;
            rpcPassword = password;
          }
          litewallet.rpcUsername = rpcUsername;
          litewallet.rpcPassword = rpcPassword;
          litewallet.rpcPort = rpcPort;
          const newConfig = Object.assign({}, config, {
            rpcUsername,
            rpcPassword,
            rpcEnabled: true,
            rpcPort
          });
          fs.writeJsonSync(filePath, newConfig);
        }
        const preppedWallets = walletsToSave
          .map(w => w.wallet.set({
            username: w.rpcUsername,
            password: w.rpcPassword,
            port: w.rpcPort
          }));
        const block = state.get('wallets').find(w => w.abbr === 'BLOCK');
        putConfs(preppedWallets, block.directory, true);
        const cloudChainsDir = state.get('litewalletConfigDirectory');
        ipcRenderer.send('saveLitewalletConfigDirectory', cloudChainsDir);
        let ccUpdated;
        try {
          const ccConfig = fs.readJsonSync(path.join(cloudChainsDir, 'settings', 'config-master.json'));
          if(ccConfig.rpcPort && ccConfig.rpcUsername && ccConfig.rpcPassword) {
            const walletErrors = [];
            const allReqs = [];
            let walletCount = 0;
            for(const { abbr } of walletsToSave) {
              walletCount++;
              allReqs.push({token: abbr, req: request
                .post(`http://127.0.0.1:${ccConfig.rpcPort}`)
                .timeout(5000)
                .auth(ccConfig.rpcUsername, ccConfig.rpcPassword)
                .send(JSON.stringify({
                  method: 'reloadconfig',
                  params: [
                    abbr
                  ]
                }))});
            }
            // Wait for all requests to complete
            await new Promise(resolve => {
              const done = () => {
                walletCount--;
                if (walletCount <= 0)
                  resolve();
              };
              for (const {token, req} of allReqs)
                req.then(() => done()).catch(e2 => {
                  walletErrors.push(`failed to reload litewallet config for ${token}: ${e2}`);
                  done();
                });
            });
            for (const emsg of walletErrors)
              handleError(new Error(emsg));
            ccUpdated = walletErrors.length < walletsToSave.length; // if no wallets updated then notify user
          } else {
            ccUpdated = false;
          }
        } catch(err) {
          handleError(err);
          ccUpdated = false;
        }
        if(!ccUpdated)
          alert(Localize.text('Block DX cannot connect to XLite wallet. Please start or restart XLite to continue using Block DX.', 'configurationWindowWallets'));
        ipcRenderer.send('loadXBridgeConf');
        setTimeout(() => {
          ipcRenderer.send('restart');
        }, 500);
      } else {
        const skip = state.get('skipSetup');
        if(skip) {
          router.goTo(route.ENTER_BLOCKNET_CREDENTIALS);
        } else {
          router.goTo(route.EXPERT_SELECT_WALLET_VERSIONS);
        }
      }
    });

    $('.js-blocknetWalletLink').on('click', e => {
      e.preventDefault();
      remote.shell.openExternal('https://github.com/blocknetdx/blocknet/releases/latest');
    });

  }

}

module.exports = SelectWallets;
