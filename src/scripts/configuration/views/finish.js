/* global Localize */

const { ipcRenderer } = require('electron');
const { RouterView } = require('../../modules/router');
const route = require('../constants/routes');
const configurationTypes = require('../constants/configuration-types');
const titles = require('../modules/titles');
const { saveConfs, addConfs, handleError, updateConfs } = require('../util');
const sidebar = require('../snippets/sidebar');

class Finish extends RouterView {

  constructor(options) {
    super(options);
  }

  render(state) {

    const { $target } = this;

    const styles = {
      p: 'margin-top:0;padding-top:0;padding-left:10px;padding-right:10px;margin-bottom:20px;',
      mainArea: 'margin-top:-10px;padding-top:0;background-color:#0e2742;overflow-y:auto;'
    };

    const quick = state.get('quickSetup');
    const configurationType = state.get('configurationType');
    let title;
    if(configurationType === configurationTypes.ADD_NEW_WALLETS) {
      title = quick ? titles.ADD_WALLET_QUICK_CONFIGURATION() : titles.ADD_WALLET_EXPERT_CONFIGURATION();
    } else if(configurationType === configurationTypes.UPDATE_WALLETS) {
      title = quick ? titles.UPDATE_WALLET_QUICK_CONFIGURATION() : titles.UPDATE_WALLET_EXPERT_CONFIGURATION();
    } else if(configurationType === configurationTypes.FRESH_SETUP) {
      title = quick ? titles.FRESH_SETUP_QUICK_CONFIGURATION() : titles.FRESH_SETUP_EXPERT_CONFIGURATION();
    } else {
      title = titles.RPC_SETTINGS();
    }

    const html = `
          <h3>${title}</h3>
          <div class="container">
            <div class="flex-container">
              <div class="col1">
                ${sidebar(1)}
              </div>
              <div class="col2">

                <p style="${styles.p}">${Localize.text('Upon selecting FINISH, the configurations set will be saved.','configurationWindowFinish')}</p>

                <p style="${styles.p}"><strong>${Localize.text('Note', 'configurationWindowFinish')}:</strong> ${Localize.text('Staking will be disabled on all configured wallets. Staking is not recommended for any wallet connected to Block DX, as it can interfere with your ability to trade.','configurationWindowFinish')}</p>

                <div class="main-area" style="${styles.mainArea}"></div>
                <div id="js-buttonContainer" class="button-container">
                  <button id="js-backBtn" type="button" class="gray-button">${Localize.text('Back','configurationWindowFinish').toUpperCase()}</button>
                  <button id="js-continueBtn" type="button">${Localize.text('Finish','configurationWindowFinish').toUpperCase()}</button>
                </div>

              </div>
            </div>
          </div>
        `;
    $target.html(html);
  }

  onMount(state, router) {
    const { $ } = this;

    $('#js-backBtn').on('click', e => {
      e.preventDefault();
      const configurationType = state.get('configurationType');
      if(configurationType === configurationTypes.UPDATE_RPC_SETTINGS) {
        router.goTo(route.ENTER_BLOCKNET_CREDENTIALS);
      } else {
        if(state.get('quickSetup')) {
          router.goTo(route.SELECT_WALLET_VERSIONS);
        } else { // Expert Setup
          router.goTo(route.EXPERT_SELECT_SETUP_TYPE);
        }
      }
    });

    $('#js-continueBtn').on('click', async function(e) {
      try {
        e.preventDefault();

        const wallets = state.get('wallets');
        const configurationType = state.get('configurationType');
        const addingWallets = configurationType === configurationTypes.ADD_NEW_WALLETS;
        const updatingWallets = configurationType === configurationTypes.UPDATE_WALLETS;

        if(configurationType === configurationTypes.UPDATE_RPC_SETTINGS) {
          const port = state.get('rpcPort');
          const rpcIP = state.get('rpcIP');
          const username = state.get('username');
          const password = state.get('password');
          ipcRenderer.sendSync('saveDXData', username, password, port, rpcIP);
        } else {
          if(state.get('quickSetup')) {
            const addAbbrToVersion = state.get('addAbbrToVersion');
            const updateAbbrToVersion = state.get('updateAbbrToVersion');
            let selectedWallets = state.get('selectedWallets');
            const skipList = state.get('skipList');

            const filtered = wallets
              .filter(w => addingWallets ? addAbbrToVersion.has(w.abbr) : updatingWallets ? updateAbbrToVersion.has(w.abbr) : !skipList.has(w.abbr))
              .filter(w => addingWallets ? w.versions.includes(addAbbrToVersion.get(w.abbr)) : updatingWallets ? w.versions.includes(updateAbbrToVersion.get(w.abbr)) : selectedWallets.has(w.versionId))
              .map(w => {
                if(updatingWallets && w.abbr === 'BLOCK') {
                  return w.set({
                    username: ipcRenderer.sendSync('getUser'),
                    password: ipcRenderer.sendSync('getPassword')
                  });
                } else {
                  const credentials = w.generateCredentials();
                  return w.set({
                    username: credentials.username,
                    password: credentials.password
                  });
                }
              });

          if(configurationType !== configurationTypes.ADD_NEW_WALLETS) ipcRenderer.sendSync('setTokenPaths', null);

            if(addingWallets) {
              for(const [ abbr, version ] of addAbbrToVersion.entries()) {
                const filteredWallets = wallets.filter(w => w.abbr === abbr);
                const selectedWallet = wallets.find(w => w.abbr === abbr && w.versions.includes(version));
                for(const w of filteredWallets) {
                  selectedWallets = selectedWallets.delete(w.versionId);
                }
                selectedWallets = selectedWallets.add(selectedWallet.versionId);
              }
            } else if(updatingWallets) {
              for(const [ abbr, version ] of updateAbbrToVersion.entries()) {
                const filteredWallets = wallets.filter(w => w.abbr === abbr);
                const selectedWallet = wallets.find(w => w.abbr === abbr && w.versions.includes(version));
                for(const w of filteredWallets) {
                  selectedWallets = selectedWallets.delete(w.versionId);
                }
                selectedWallets = selectedWallets.add(selectedWallet.versionId);
              }
            } else {
              for(const versionId of [...selectedWallets]) {
                if(!filtered.some(w => w.versionId === versionId)) selectedWallets = selectedWallets.delete(versionId);
              }
            }

            if(addingWallets) {
              const block = wallets
                .find(w => w.abbr === 'BLOCK');
              addConfs(filtered, block.directory);
            } else if(updatingWallets) {
              const block = wallets
                .find(w => w.abbr === 'BLOCK');
              updateConfs(filtered, block.directory);
            } else {
              saveConfs(filtered);
              const block = filtered
                .find(w => w.abbr === 'BLOCK');
              const { username, password } = block;
              const port = state.get('rpcPort');
              const rpcIP = state.get('rpcIP');
              ipcRenderer.sendSync('saveDXData', username, password, port, rpcIP);
            }

            ipcRenderer.sendSync('saveSelected', [...selectedWallets]);

          } else { // Expert Setup

            const selectedListName = addingWallets ? 'addWallets' : updatingWallets ? 'updateWallets' : 'selectedWallets';

            const selectedWallets = state.get(selectedListName);

            let filtered = wallets
              .filter(w => selectedWallets.has(w.versionId));

            ipcRenderer.sendSync('setTokenPaths', filtered);

            if(!state.get('skipSetup')) {
              filtered = filtered
                .map(w => {
                  if(state.get('generateCredentials')) {
                    if(updatingWallets && w.abbr === 'BLOCK') {
                      return w.set({
                        username: ipcRenderer.sendSync('getUser'),
                        password: ipcRenderer.sendSync('getPassword')
                      });
                    } else {
                      const credentials = w.generateCredentials();
                      return w.set({
                        username: credentials.username,
                        password: credentials.password
                      });
                    }
                  } else {
                    return w;
                  }
                });
              if(addingWallets || updatingWallets) {
                let selected = state.get('selectedWallets');
                for(const { abbr, versionId } of filtered) {
                  const filteredWallets = wallets.filter(w => w.abbr === abbr);
                  for(const w of filteredWallets) {
                    selected = selected.delete(w.versionId);
                  }
                  selected = selected.add(versionId);
                }
                const block = state.get('wallets').find(w => w.abbr === 'BLOCK');
                if(addingWallets) {
                  addConfs(filtered, block.directory);
                } else { // updating wallets
                  updateConfs(filtered, block.directory);
                  if(filtered.some(w => w.abbr === 'BLOCK')) {
                    const port = state.get('rpcPort');
                    const rpcIP = state.get('rpcIP');
                    const username = block.username || ipcRenderer.sendSync('getUser');
                    const password = block.password || ipcRenderer.sendSync('getPassword');
                    ipcRenderer.sendSync('saveDXData', username, password, port, rpcIP);
                  }
                }
                ipcRenderer.sendSync('saveSelected', [...selected]);
              } else {
                saveConfs(filtered);
              }
            }

            if(!addingWallets && !updatingWallets) {
              const block = filtered
                .find(w => w.abbr === 'BLOCK');
              const { username, password } = block;
              const port = state.get('rpcPort');
              const rpcIP = state.get('rpcIP');
              ipcRenderer.sendSync('saveDXData', username, password, port, rpcIP);
              ipcRenderer.sendSync('saveSelected', [...selectedWallets]);
            }
          }

        }
        router.goTo(route.CONFIGURATION_COMPLETE);
      } catch(err) {
        handleError(err);
      }
    });
  }

}

module.exports = Finish;
