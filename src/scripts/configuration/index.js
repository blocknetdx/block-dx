/* global $, swal */

const fs = require('fs');
const path = require('path');
const { ipcRenderer } = require('electron');
const { dialog } = require('electron').remote;
const { Set } = require('immutable');
const renderSidebar = require('./scripts/configuration/modules/sidebar');
const renderConfiguration1 = require('./scripts/configuration/modules/configuration01');
const renderConfiguration2 = require('./scripts/configuration/modules/configuration02');
const renderConfiguration3 = require('./scripts/configuration/modules/configuration03');
const renderSettings1 = require('./scripts/configuration/modules/settings01');
const renderSettings2 = require('./scripts/configuration/modules/settings02');
const renderSettings3 = require('./scripts/configuration/modules/settings03');
const renderComplete = require('./scripts/configuration/modules/complete');

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

}

$(document).ready(() => {

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

  state.set('sidebarSelected', 0);
  state.set('sidebarItems', [
    {text: 'Configuration Setup'},
    {text: 'RPC Settings'}
  ]);
  state.set('selectedWallets', Set(['BLOCK']));

  // const versions = ['0.1.1', '0.1.2', '0.1.3', '0.1.4'];
  // const latest = versions[versions.length -1];
  // state.set('wallets', [
  //   {name: 'Blocknet', abbr: 'BLOCK', directory: '', error: false, username: '', password: '', version: latest, versions},
  //   {name: 'Bitcoin', abbr: 'BTC', directory: '', error: false, username: '', password: '', version: latest, versions},
  //   {name: 'Mona', abbr: 'MONA', directory: '', error: false, username: '', password: '', version: latest, versions},
  //   {name: 'Sys', abbr: 'SYS', directory: '', error: false, username: '', password: '', version: latest, versions}
  // ]);
  state.set('skipSetup', false);
  state.set('active', 'configuration1');
  state.set('generateCredentials', true);
  state.set('rpcPort', '41414');
  state.set('rpcUser', '');
  state.set('rpcPassword', '');

  const checkForDataFolders = () => {
    const dataPath = ipcRenderer.sendSync('getDataPath');
    const allWallets = state.get('wallets');
    const selectedWallets = state.get('selectedWallets');
    const newWallets = allWallets
      .map(w => {
        if(!selectedWallets.has(w.abbr)) return w;
        try {
          if(w.directory) {
            fs.statSync(w.directory);
            w = w.set('error', false);
          } else {
            const { platform } = process;
            const folder = platform === 'win32' ? w.dirNameWin : (platform === 'darwin' || !w.dirNameLinux) ? w.dirNameMac : w.dirNameLinux;
            if(!folder) throw new Error();
            const fullPath = path.join(dataPath, folder);
            fs.statSync(fullPath);
            w = w.set({
              directory: fullPath,
              error: false
            });
          }
          return w;
        } catch(err) {
          console.error(err);
          w = w.set({
            directory: '',
            error: true
          });
          return w;
        }
      });
    state.set('wallets', newWallets);
  };

  const render = () => {

    const sidebarSelected = state.get('sidebarSelected');
    const allWallets = state.get('wallets');
    const selectedWalletsSet = state.get('selectedWallets');
    const filteredWallets = allWallets
      .filter(w => selectedWalletsSet.has(w.abbr));

    const active = state.get('active');
    const sidebarHTML = renderSidebar({ state });
    let mainHTML;
    switch(active) {
      case 'configuration1':
        mainHTML = renderConfiguration1({ state });
        break;
      case 'configuration2':
        mainHTML = renderConfiguration2({ wallets: filteredWallets });
        break;
      case 'configuration3':
        checkForDataFolders();
        mainHTML = renderConfiguration3({ state });
        break;
      case 'settings1':
        mainHTML = renderSettings1({ state });
        break;
      case 'settings2':
        mainHTML = renderSettings2({ wallets: filteredWallets });
        break;
      case 'settings3':
        mainHTML = renderSettings3({ state });
        break;
      case 'complete':
        mainHTML = renderComplete();
        break;
      default:
        mainHTML = '';
    }

    const html = `
          <h3>${active === 'complete' ? 'SETUP COMPLETE' : sidebarSelected === 0 ? 'CONFIGURATION SETUP' : 'RPC SETTINGS'}</h3>
          <div class="container">
            <div class="flex-container">
              <div class="col1">
                ${sidebarHTML}
              </div>
              <div class="col2">
                ${mainHTML}
              </div>
            </div>
          </div>
        `;

    $('#js-main').html(html);
    setTimeout(() => {

      $('.js-mainAreaItem')
        .off('click')
        .on('click', e => {
          e.preventDefault();
          const abbr = $(e.currentTarget).attr('data-abbr');
          const $target = $(e.currentTarget).find('i');
          const selectedWallets = state.get('selectedWallets');
          if($target.hasClass('fa-check-square')) { // it is checked
            $target.addClass('fa-square');
            $target.removeClass('fa-check-square');
            state.set('selectedWallets', selectedWallets.delete(abbr));
          } else { // it is not checked
            $target.addClass('fa-check-square');
            $target.removeClass('fa-square');
            state.set('selectedWallets', selectedWallets.add(abbr));
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
            $main.css('opacity', '.6');
            $main.css('overflow-y', 'hidden');
            state.set('skipSetup', true);
            $overlay.css('display', 'block');
          }
        });

      $('#js-continueBtn')
        .off('click')
        .on('click', e => {
          e.preventDefault();
          const generateCredentials = state.get('generateCredentials');
          const skipSetup = state.get('skipSetup');
          switch(active) {
            case 'configuration1':
              if(skipSetup) {
                state.set('active', 'settings3');
                state.set('sidebarSelected', 1);
              } else {
                state.set('active', 'configuration2');
                state.set('sidebarSelected', 0);
              }
              break;
            case 'configuration2':
              state.set('active', 'configuration3');
              state.set('sidebarSelected', 0);
              break;
            case 'configuration3':
              state.set('active', 'settings1');
              state.set('sidebarSelected', 1);
              break;
            case 'settings1':
              if(generateCredentials) {
                state.set('active', 'complete');
                state.set('sidebarSelected', 1);
              } else {
                state.set('active', 'settings2');
                state.set('sidebarSelected', 1);
              }
              break;
            case 'settings2':
              state.set('active', 'settings3');
              state.set('sidebarSelected', 1);
              break;
            case 'settings3':
              state.set('active', 'complete');
              state.set('sidebarSelected', 1);
              break;
          }
          render();
        });

      $('#js-backBtn')
        .off('click')
        .on('click', e => {
          e.preventDefault();
          const generateCredentials = state.get('generateCredentials');
          const skipSetup = state.get('skipSetup');
          switch(active) {
            case 'configuration2':
              state.set('active', 'configuration1');
              state.set('sidebarSelected', 0);
              break;
            case 'configuration3':
              state.set('active', 'configuration2');
              state.set('sidebarSelected', 0);
              break;
            case 'settings1':
              state.set('active', 'configuration3');
              state.set('sidebarSelected', 0);
              break;
            case 'settings2':
              state.set('active', 'settings1');
              state.set('sidebarSelected', 1);
              break;
            case 'settings3':
              if(skipSetup) {
                state.set('active', 'configuration1');
                state.set('sidebarSelected', 0);
              } else {
                state.set('active', 'settings2');
                state.set('sidebarSelected', 1);
              }
              break;
            case 'complete':
              if(!skipSetup && generateCredentials) {
                state.set('active', 'settings1');
                state.set('sidebarSelected', 1);
              } else {
                state.set('active', 'settings3');
                state.set('sidebarSelected', 1);
              }
              break;
          }
          render();
        });

      $('.js-browseBtn')
        .off('click')
        .on('click', e => {
          e.preventDefault();
          const abbr = $(e.currentTarget).attr('data-abbr');
          const wallets = state.get('wallets');
          const idx = wallets.findIndex(w => w.abbr === abbr);
          dialog.showOpenDialog({
            title: `${wallets[idx].name} Data Directory`,
            defaultPath: ipcRenderer.sendSync('getDataPath'),
            properties: ['openDirectory']
          }, ([ directoryPath ]) => {
            if(directoryPath) {
              $(`#${abbr}`).val(directoryPath);
              $(`#${abbr}-error`).css('display', 'none');
              const newWallets = [
                ...wallets.slice(0, idx),
                wallets[idx].set({directory: directoryPath, error: false}),
                ...wallets.slice(idx + 1)
              ];
              state.set('wallets', newWallets);
              const selectedWallets = state.get('selectedWallets');
              const filtered = newWallets
                .filter(w => selectedWallets.has(w.abbr));
              const errorCount = filtered.reduce((num, w) => (!w.error && w.directory) ? num : num + 1, 0);
              if(errorCount === 0) {
                $('#js-errors').css('display', 'none');
              } else {
                $('#js-errorCount').text(errorCount);
                $('#js-errors').css('display', 'block');
              }
            }
          });
        });
      const toggleCredentialGeneration = e => {
        e.preventDefault();
        const generateCredentials = state.get('generateCredentials');
        state.set('generateCredentials', !generateCredentials);
        const $automatic = $('#js-automaticCredentials').find('i');
        const $manual = $('#js-manualCredentials').find('i');
        if(generateCredentials) {
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
      $('#js-automaticCredentials')
        .off('click')
        .on('click', toggleCredentialGeneration);
      $('#js-manualCredentials')
        .off('click')
        .on('click', toggleCredentialGeneration);
      $('.js-usernameInput')
        .off('change')
        .on('change', e => {
          const wallets = state.get('wallets');
          const { value } = e.target;
          const abbr = $(e.target).attr('data-abbr');
          const idx = wallets.findIndex(w => w.abbr === abbr);
          const newWallets = [
            ...wallets.slice(0, idx),
            wallets[idx].set({username: value.trim()}),
            ...wallets.slice(idx + 1)
          ];
          state.set('wallets', newWallets);
        });
      $('.js-passwordInput')
        .off('change')
        .on('change', e => {
          const wallets = state.get('wallets');
          const { value } = e.target;
          const abbr = $(e.target).attr('data-abbr');
          const idx = wallets.findIndex(w => w.abbr === abbr);
          const newWallets = [
            ...wallets.slice(0, idx),
            wallets[idx].set({password: value}),
            ...wallets.slice(idx + 1)
          ];
          state.set('wallets', newWallets);
        });
      $('#js-rpcPort')
        .off('change')
        .on('change', e => {
          const value = e.target.value.trim();
          state.set('rpcPort', value);
        });
      $('#js-rpcUser')
        .off('change')
        .on('change', e => {
          const wallets = state.get('wallets');
          const { value } = e.target;
          const idx = wallets.findIndex(w => w.abbr === 'BLOCK');
          const newWallets = [
            ...wallets.slice(0, idx),
            wallets[idx].set({username: value.trim()}),
            ...wallets.slice(idx + 1)
          ];
          state.set('wallets', newWallets);
        });
      $('#js-rpcPassword')
        .off('change')
        .on('change', e => {
          const wallets = state.get('wallets');
          const { value } = e.target;
          const idx = wallets.findIndex(w => w.abbr === 'BLOCK');
          const newWallets = [
            ...wallets.slice(0, idx),
            wallets[idx].set({password: value}),
            ...wallets.slice(idx + 1)
          ];
          state.set('wallets', newWallets);
        });

      $('.js-versionDropdownButton')
        .off('click')
        .on('click', e => {
          e.preventDefault();

          const closeDropdowns = callback => {
            const $target = $('#js-mainConfigurationArea');
            const $icons = $target.find('i.fa-angle-up');
            $target.find('.js-dropdownMenu').remove();
            $icons
              .addClass('fa-angle-down')
              .removeClass('fa-angle-up');
            if(callback) setTimeout(callback, 0);
          };

          $('#js-mainConfigurationArea')
            .off('click')
            .on('click', ee => {
              const $target = $(ee.target);
              if(!$target.hasClass('js-versionDropdownButton') && !$target.parent().hasClass('js-versionDropdownButton')) {
                closeDropdowns();
              }

              // console.log('Clicked!', e.target);
              // const $icons = $(e.currentTarget).find('i.fa-angle-up');
              // $(e.currentTarget).find('.js-dropdownMenu').remove();
              // $icons
              //   .addClass('fa-angle-down')
              //   .removeClass('fa-angle-up');

            });

          const $target = $(e.currentTarget);
          const abbr = $target.attr('data-abbr');
          const wallets = state.get('wallets');
          const idx = wallets.findIndex(w => w.abbr === abbr);
          const wallet = wallets[idx];
          const $icon = $target.find('i');
          if($icon.hasClass('fa-angle-down')) { // dropdown currently closed

            const height = $target.outerHeight();
            const width = $target.outerWidth();

            closeDropdowns(() => {

              $icon.addClass('fa-angle-up');
              $icon.removeClass('fa-angle-down');

              $target.append(`
                    <div class="js-dropdownMenu" style="z-index:1000;position:absolute;top:${height}px;left:0;background-color:#ddd;width:${width}px;max-height:162px;overflow-y:auto;">
                      ${[...wallet.versions].reverse().map(v => `<div class="js-dropdownMenuItem dropdown-button" data-version="${v}"><div>${v}</div></div>`).join('')}
                    </div>
                  `);

              setTimeout(() => {
                $('.js-dropdownMenuItem')
                  .off('click')
                  .on('click', ee => {
                    ee.preventDefault();
                    const v = $(ee.currentTarget).attr('data-version');
                    state.set('wallets', [
                      ...wallets.slice(0, idx),
                      wallets[idx].set({version: v}),
                      ...wallets.slice(idx + 1)
                    ]);
                    $($target.find('div')[0]).text(v);
                  });
              }, 0);
            });

          } else { // dropdown currently open
            closeDropdowns();
          }
        });

    }, 0);
  };

  Promise
    .all([

      new Promise(resolve => {
        ipcRenderer.send('getManifest');
        ipcRenderer.on('manifest', (e, wallets) => {
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
          wallets  = wallets.reduce((arr, w) => {
            const idx = arr.findIndex(ww => ww.abbr === w.abbr);
            if(idx > -1) {
              return [
                ...arr.slice(0, idx),
                arr[idx].set('versions', [...arr[idx].versions, ...w.versions]),
                ...arr.slice(idx + 1)
              ];
            } else {
              return [
                ...arr,
                w
              ];
            }
          }, []);
          resolve(wallets);
        });
      })

    ])
    .then(([ wallets ]) => {

      state.set('wallets', wallets);

      render();
    })
    .catch(err => {
      console.error(err);
    });

});
