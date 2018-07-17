/* global $, swal */

const fs = require('fs-extra-promise');
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
const renderFinalInstructions = require('./scripts/configuration/modules/final-instructions');
const { removeNonWordCharacters, splitConf, joinConf } = require('./scripts/configuration/modules/util');
const Wallet = require('./scripts/configuration/modules/wallet');

const handleError = err => {
  console.error(err);
  alert(err);
};

window.onerror = handleError;

class XBridgeConf {

  constructor(address) {
    this._address = address;
    this._data = new Map();
  }

  add(wallet) {
    const { abbr, directory, xBridgeConf, username, password } = wallet;
    if(abbr === 'BLOCK') this._directory = directory;
    const confStr = ipcRenderer.sendSync('getBridgeConf', xBridgeConf);
    const conf = splitConf(confStr);
    this._data.set(abbr, Object.assign({}, conf, {
      Username: username,
      Password: password,
      Address: ''
    }));
  }

  save() {
    const data = [
      [
        '[Main]',
        `ExchangeWallets=${[...this._data.keys()].join(',')}`,
        'FullLog=true',
        'LogPath=',
        'ExchangeTax=300'
      ].join('\n'),
      '\n',
      ...[...this._data.entries()]
        .map(([ abbr, conf ]) => {
          return [
            `\n[${abbr}]`,
            joinConf(conf)
          ].join('\n');
        })
    ].join('');
    const confPath = path.join(this._directory, 'xbridge.conf');
    let confExists;
    try {
      fs.statSync(confPath);
      confExists = true;
    } catch(err) {
      confExists = false;
    }
    if(confExists) {
      const currentConf = fs.readFileSync(confPath, 'utf8');
      if(data !== currentConf) {
        fs.copySync(confPath, path.join(this._directory, `xbridge-${new Date().getTime()}.conf`));
      }
    }
    fs.writeFileSync(confPath, data, 'utf8');
    return data;
  }

}

const generateXBridgeConf = wallets => {
  const conf = new XBridgeConf();
  for(const wallet of wallets) {
    conf.add(wallet);
  }
  const confStr = conf.save();
  console.log(confStr);
};

const saveConfs = wallets => {
  const confs = new Map();
  for(const w of wallets) {
    const conf = w.saveWalletConf();
    confs.set(w.abbr, conf);
  }
  generateXBridgeConf(wallets);
  return confs;
};

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

  const checkForDataFolders = () => {
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
            const fullPath = w.getDefaultDirectory();
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
      case 'finalInstructions':
        mainHTML = renderFinalInstructions();
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
          const abbr = $(e.currentTarget).attr('data-id');
          const $target = $(e.currentTarget).find('i');
          // const selectedWallets = state.get('selectedWallets');
          const selectedAbbrs = state.get('selectedAbbrs');
          if(selectedAbbrs.has(abbr)) { // it is checked
            $target.addClass('fa-square');
            $target.removeClass('fa-check-square');
            state.set('selectedAbbrs', selectedAbbrs.delete(abbr));
          } else { // it is not checked
            $target.addClass('fa-check-square');
            $target.removeClass('fa-square');
            state.set('selectedAbbrs', selectedAbbrs.add(abbr));
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

      $('#js-continueBtn')
        .off('click')
        .on('click', async function(e) {
          e.preventDefault();
          const generateCredentials = state.get('generateCredentials');
          const skipSetup = state.get('skipSetup');
          switch(active) {
            case 'configuration1': {
              if (skipSetup) {
                state.set('active', 'settings3');
                state.set('sidebarSelected', 1);
              } else {
                const wallets = state.get('wallets');
                let selectedWallets = state.get('selectedWallets');
                const selectedAbbrs = state.get('selectedAbbrs');
                const versionGroups = wallets
                  .reduce((map, w) => {
                    if(!selectedAbbrs.has(w.abbr)) {
                      selectedWallets = selectedWallets.delete(w.versionId);
                      state.set('selectedWallets', selectedWallets);
                      return map;
                    } else if(map.has(w.abbr)) {
                      return map.set(w.abbr, [...map.get(w.abbr), w.versionId]);
                    } else {
                      return map.set(w.abbr, [w.versionId]);
                    }
                  }, new Map());
                for(const ids of [...versionGroups.values()]) {
                  if(!ids.some(id => selectedWallets.has(id))) {
                    selectedWallets = selectedWallets.add(ids[ids.length - 1]);
                  }
                }
                state.set('selectedWallets', selectedWallets);
                state.set('active', 'configuration2');
                state.set('sidebarSelected', 0);
              }
              break;
            } case 'configuration2':
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
                const newSelectedAbbrs = hasErrors
                  .reduce((set, w) => {
                    return set.delete(w.abbr);
                  }, state.get('selectedAbbrs'));
                state.set('selectedAbbrs', newSelectedAbbrs);
              }
              state.set('active', 'settings1');
              state.set('sidebarSelected', 1);
              break;
            } case 'settings1':
              if(generateCredentials) {
                let wallets = state.get('wallets');
                const updatedWallets = filteredWallets.map(w => {
                  const { username, password } = w;
                  if(!username || !password) {
                    const credentials = w.generateCredentials();
                    w = w.set({
                      username: credentials.username,
                      password: credentials.password
                    });
                  }
                  return w;
                });
                updatedWallets.forEach(w => {
                  const idx = wallets.findIndex(ww => ww.versionId === w.versionId);
                  wallets = [
                    ...wallets.slice(0, idx),
                    w,
                    ...wallets.slice(idx + 1)
                  ];
                });
                state.set('wallets', wallets);
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
                  const newSelectedAbbrs = incomplete
                    .reduce((set, w) => {
                      return set.delete(w.abbr);
                    }, state.get('selectedAbbrs'));
                  state.set('selectedAbbrs', newSelectedAbbrs);
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
            } case 'complete': {

              const wallets = state.get('wallets');
              const selectedWallets = state.get('selectedWallets');

              // they did not manually enter their setup information
              if(!state.get('skipSetup')) {
                const filtered = wallets
                  .filter(w => selectedWallets.has(w.versionId));
                saveConfs(filtered);
              }

              const block = wallets
                .find(w => w.abbr === 'BLOCK');
              const { username, password } = block;
              const port = state.get('rpcPort');
              ipcRenderer.sendSync('saveDXData', username, password, port);
              ipcRenderer.sendSync('saveSelected', [...selectedWalletsSet]);
              state.set('active', 'finalInstructions');
              state.set('sidebarSelected', 1);
              break;
            } case 'finalInstructions':

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
            case 'finalInstructions':
              ipcRenderer.send('quit');
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
            defaultPath: ipcRenderer.sendSync('getHomePath'),
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
            });

          const $target = $(e.currentTarget);
          const abbr = $target.attr('data-abbr');
          const wallets = state.get('wallets');
          const versions = wallets
            .filter(w => w.abbr === abbr)
            .reduce((arr, w) => {
              return arr.concat(w.versions);
            }, []);
          const $icon = $target.find('i');
          if($icon.hasClass('fa-angle-down')) { // dropdown currently closed

            const height = $target.outerHeight();
            const width = $target.outerWidth();

            closeDropdowns(() => {

              $icon.addClass('fa-angle-up');
              $icon.removeClass('fa-angle-down');

              $target.append(`
                    <div class="js-dropdownMenu" style="z-index:1000;position:absolute;top:${height}px;left:0;background-color:#ddd;width:${width}px;max-height:162px;overflow-y:auto;">
                      ${[...versions].reverse().map(v => `<div class="js-dropdownMenuItem dropdown-button" data-version="${v}"><div>${v}</div></div>`).join('')}
                    </div>
                  `);

              setTimeout(() => {
                $('.js-dropdownMenuItem')
                  .off('click')
                  .on('click', ee => {
                    ee.preventDefault();
                    let selectedWallets = state.get('selectedWallets');
                    const v = $(ee.currentTarget).attr('data-version');
                    const idx = wallets
                      .findIndex(w => w.abbr === abbr && w.versions.includes(v));
                    state.set('wallets', [
                      ...wallets.slice(0, idx),
                      wallets[idx].set({version: v}),
                      ...wallets.slice(idx + 1)
                    ]);
                    $($target.find('div')[0]).text(v);
                    const versionId = wallets[idx].versionId;
                    for(const w of wallets) {
                      if(w.abbr === abbr) selectedWallets = selectedWallets.delete(w.versionId);
                    }
                    selectedWallets = selectedWallets.add(versionId);
                    state.set('selectedWallets', selectedWallets);
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
          const selectedWalletIds = new Set([
            wallets[0].versionId,
            ...ipcRenderer.sendSync('getSelected')
          ]);
          const selectedAbbrs = new Set([...wallets
            .filter(w => selectedWalletIds.has(w.versionId))
            .map(w => w.abbr)
          ]);
          state.set('selectedWallets', selectedWalletIds);
          state.set('selectedAbbrs', selectedAbbrs);

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
    .catch(handleError);

});
