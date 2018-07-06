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
const { removeNonWordCharacters } = require('./scripts/configuration/modules/util');
const Wallet = require('./scripts/configuration/modules/wallet');

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
  // state.set('selectedWallets', Set(['BLOCK']));

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
        if(!selectedWallets.has(w.versionId)) return w;
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
          // console.error(err);
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
      .filter(w => selectedWalletsSet.has(w.versionId));

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
          const versionId = $(e.currentTarget).attr('data-id');
          const $target = $(e.currentTarget).find('i');
          const selectedWallets = state.get('selectedWallets');
          if($target.hasClass('fa-check-square')) { // it is checked
            $target.addClass('fa-square');
            $target.removeClass('fa-check-square');
            state.set('selectedWallets', selectedWallets.delete(versionId));
          } else { // it is not checked
            $target.addClass('fa-check-square');
            $target.removeClass('fa-square');
            state.set('selectedWallets', selectedWallets.add(versionId));
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
        .on('click', async function(e) {
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
            case 'configuration3': {
              const wallets = state.get('wallets');
              const selected = state.get('selectedWallets');
              const hasErrors = wallets
                .filter(w => selected.has(w.versionId))
                .filter(w => w.error);
              if(hasErrors.length > 0) {
                const newSelected = hasErrors
                  .reduce((set, w) => {
                    return set.delete(w.versionId);
                  }, selected);
                state.set('selectedWallets', newSelected);
              }
              state.set('active', 'settings1');
              state.set('sidebarSelected', 1);
              break;
            } case 'settings1':
              if(generateCredentials) {
                filteredWallets.forEach(w => console.log(JSON.stringify(w.generateCredentials())));
                state.set('active', 'complete');
                state.set('sidebarSelected', 1);
              } else {
                state.set('active', 'settings2');
                state.set('sidebarSelected', 1);
              }
              break;
            case 'settings2': {
              const wallets = state.get('wallets');
              const selected = state.get('selectedWallets');
              const incomplete = wallets
                .filter(w => selected.has(w.versionId))
                .filter(w => !w.username || !w.password);
              if(incomplete.length > 0) {
                if(incomplete.some(w => w.abbr === 'BLOCK')) {
                  await swal({
                    title: 'Missing Credentials',
                    html: `You must enter credentials for ${incomplete[0].name} in order to continue.`,
                    type: 'error',
                    showConfirmButton: true,
                    confirmButtonText: 'OK'
                  });
                  return;
                }
                const { dismiss } = await swal({
                  title: 'Missing Credentials',
                  html: `Credentials for the coins listed below have not been entered. Select 'Cancel' to add credentials for these coins. If 'Continue' is selected, these coins will not be setup for trading.<br><br>${incomplete.map(w => w.name).join('<br>')}`,
                  type: 'warning',
                  showConfirmButton: true,
                  confirmButtonText: 'Continue',
                  showCancelButton: true,
                  cancelButtonText: 'Cancel',
                  reverseButtons: true
                });
                if(dismiss === 'cancel') {
                  return;
                } else {
                  const newSelected = incomplete
                    .reduce((set, w) => {
                      return set.delete(w.versionId);
                    }, selected);
                  state.set('selectedWallets', newSelected);
                }
              }
              state.set('active', 'settings3');
              state.set('sidebarSelected', 1);
              break;
            } case 'settings3': {
              const [ wallet ] = state.get('wallets');
              if(!wallet.username || !wallet.password) {
                await swal({
                  title: 'Missing Credentials',
                  html: `You must enter credentials for ${wallet.name} in order to continue.`,
                  type: 'error',
                  showConfirmButton: true,
                  confirmButtonText: 'OK'
                });
                return;
              }
              state.set('active', 'complete');
              state.set('sidebarSelected', 1);
              break;
            } case 'complete':
              ipcRenderer.send('restart');
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
            case 'configuration1':
              ipcRenderer.send('quit');
              return;
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
              if (skipSetup) {
                state.set('active', 'configuration1');
                state.set('sidebarSelected', 0);
              } else {
                state.set('active', 'settings2');
                state.set('sidebarSelected', 1);
              }
              break;
            case 'complete':
              if (!skipSetup && generateCredentials) {
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
          const versionId = $(e.currentTarget).attr('data-id');
          const wallets = state.get('wallets');
          const idx = wallets.findIndex(w => w.versionId === versionId);
          dialog.showOpenDialog({
            title: `${wallets[idx].name} Data Directory`,
            defaultPath: ipcRenderer.sendSync('getDataPath'),
            properties: ['openDirectory']
          }, ([ directoryPath ]) => {
            if(directoryPath) {
              console.log($('#' + removeNonWordCharacters(versionId)));
              $(`#${removeNonWordCharacters(versionId)}`).val(directoryPath);
              $(`#${removeNonWordCharacters(versionId)}-error`).css('display', 'none');
              const newWallets = [
                ...wallets.slice(0, idx),
                wallets[idx].set({directory: directoryPath, error: false}),
                ...wallets.slice(idx + 1)
              ];
              state.set('wallets', newWallets);
              const selectedWallets = state.get('selectedWallets');
              const filtered = newWallets
                .filter(w => selectedWallets.has(w.versionId));
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
          const versionId = $(e.target).attr('data-id');
          const idx = wallets.findIndex(w => w.versionId === versionId);
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
          const versionId = $(e.target).attr('data-id');
          const idx = wallets.findIndex(w => w.versionId === versionId);
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
          const versionId = $target.attr('data-id');
          const wallets = state.get('wallets');
          const idx = wallets.findIndex(w => w.versionId === versionId);
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
          state.set('selectedWallets', Set([wallets[0].versionId]));
          // wallets  = wallets.reduce((arr, w) => {
          //   const idx = arr.findIndex(ww => ww.versionId === w.versionId);
          //   if(idx > -1) {
          //     return [
          //       ...arr.slice(0, idx),
          //       arr[idx].set('versions', [...arr[idx].versions, ...w.versions]),
          //       ...arr.slice(idx + 1)
          //     ];
          //   } else {
          //     return [
          //       ...arr,
          //       w
          //     ];
          //   }
          // }, []);
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
