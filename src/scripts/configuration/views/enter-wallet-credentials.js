/* global swal, Localize */

const { RouterView } = require('../../modules/router');
const route = require('../constants/routes');
const configurationTypes = require('../constants/configuration-types');
const titles = require('../modules/titles');
const footerButtons = require('../snippets/footer-buttons');
const sidebar = require('../snippets/sidebar');

class EnterWalletCredentials extends RouterView {

  constructor(options) {
    super(options);
  }

  render(state) {

    const { $target } = this;

    const configurationType = state.get('configurationType');
    const addingWallets = configurationType === configurationTypes.ADD_NEW_WALLETS;
    const updatingWallets = configurationType === configurationTypes.UPDATE_WALLETS;
    const selectedListName = addingWallets ? 'addWallets' : updatingWallets ? 'updateWallets' : 'selectedWallets';

    const selectedWallets = state.get(selectedListName);
    const wallets = state.get('wallets')
      .filter(w => selectedWallets.has(w.versionId));

    const items = wallets
      .map(w => {
        return `
              <div class="main-area-item2">
                <div style="display:flex;flex-direction:row:flex-wrap:nowrap;justify-content:space-between;">
                  <div>${w.name}</div>
                  <div id="${w.versionId}-error" class="text-danger" style="display:none;text-align:right;">${Localize.text('Error: data directory not found','configurationWindowWalletCredentials')}</div>
                </div>
                <div style="margin-top:10px;display:flex;flex-direction:row;flex-wrap:nowrap;justify-content:flex-start;">
                  <input class="js-usernameInput" data-id="${w.versionId}" type="text" style="margin-right:10px;" value="${w.username}" placeholder="${Localize.text('RPC username','configurationWindowWalletCredentials')}" />
                  <input class="js-passwordInput" data-id="${w.versionId}" type="text" value="${w.password}" placeholder="${Localize.text('RPC password','configurationWindowWalletCredentials')}" />
                  <!--<button class="js-saveBtn" type="button" data-id="${w.versionId}" style="margin-top:0;margin-right:0;width:100px;min-width:100px;">${Localize.text('Save','configurationWindowWalletCredentials').toUpperCase()}</button>-->
                </div>
              </div>
              <div style="height:1px;"></div>
            `;
      })
      .join('\n');

    const styles = {
      p: 'margin-top:0;padding-top:0;padding-left:10px;padding-right:10px;margin-bottom:20px;',
      mainArea: 'margin-top:-10px;padding-top:0;background-color:#0e2742;overflow-y:auto;'
    };

    let title;
    if(addingWallets) {
      title = titles.ADD_WALLET_EXPERT_CONFIGURATION();
    } else if(updatingWallets) {
      title = titles.UPDATE_WALLET_EXPERT_CONFIGURATION();
    } else {
      title = titles.FRESH_SETUP_EXPERT_CONFIGURATION();
    }

    const html = `
          <h3>${title}</h3>
          <div class="container">
            <div class="flex-container">
              <div class="col1">
                ${sidebar(1)}
              </div>
              <div class="col2">

                <p style="${styles.p}">${Localize.text('Please set the RPC username and password for each wallet.','configurationWindowWalletCredentials')}</p>
                <div id="js-mainConfigurationArea" class="main-area">
                  ${items}
                </div>

                ${footerButtons()}

              </div>
            </div>
          </div>
        `;
    $target.html(html);
  }

  onMount(state, router) {
    const {$} = this;
    $('#js-backBtn').on('click', e => {
      e.preventDefault();
      router.goTo(route.EXPERT_SELECT_SETUP_TYPE);
    });
    $('#js-continueBtn').on('click', async function (e) {
      e.preventDefault();

      const configurationType = state.get('configurationType');
      const addingWallets = configurationType === configurationTypes.ADD_NEW_WALLETS;
      const updatingWallets = configurationType === configurationTypes.UPDATE_WALLETS;
      const selectedListName = addingWallets ? 'addWallets' : updatingWallets ? 'updateWallets' : 'selectedWallets';

      const wallets = state.get('wallets');
      const selected = state.get(selectedListName);
      const incomplete = wallets
        .filter(w => selected.has(w.versionId))
        .filter(w => !w.username || !w.password);
      if(incomplete.length > 0) {
        if(incomplete.some(w => w.abbr === 'BLOCK')) {
          await swal({
            title: Localize.text('Missing Credentials','configurationWindowWalletCredentials'),
            html: Localize.text('You must enter credentials for {wallet} in order to continue.','configurationWindowWalletCredentials', {wallet: incomplete[0].name}),
            type: 'error',
            showConfirmButton: true,
            confirmButtonText: Localize.text('OK', 'universal')
          });
          return;
        }
        const { dismiss } = await swal({
          title: Localize.text('Missing Credentials','configurationWindowWalletCredentials'),
          html: `${Localize.text('Credentials for the wallet(s) listed have not been entered. If CONTINUE is selected, the following asset(s) will not be setup for trading.','configurationWindowWalletCredentials')}<br><br>${incomplete.map(w => w.name).join('<br>')}`,
          type: 'warning',
          showConfirmButton: true,
          confirmButtonText: Localize.text('Continue','configurationWindowWalletCredentials'),
          showCancelButton: true,
          cancelButtonText: Localize.text('Cancel','configurationWindowWalletCredentials'),
          reverseButtons: true
        });
        if(dismiss === 'cancel') {
          return;
        } else {
          const newSelected = incomplete
            .reduce((set, w) => {
              return set.delete(w.versionId);
            }, selected);
          state.set(selectedListName, newSelected);

          const abbrsListName = addingWallets ? 'addAbbrs' : updatingWallets ? 'updateAbbrs' : 'selectedAbbrs';
          const newSelectedAbbrs = incomplete
            .reduce((set, w) => {
              return set.delete(w.abbr);
            }, state.get(abbrsListName));
          state.set(abbrsListName, newSelectedAbbrs);
        }
      }

      if(addingWallets || updatingWallets) {
        router.goTo(route.FINISH);
      } else {
        router.goTo(route.ENTER_BLOCKNET_CREDENTIALS);
      }
    });
    $('.js-usernameInput').on('change', e => {
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
    $('.js-passwordInput').on('change', e => {
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
  }

}

module.exports = EnterWalletCredentials;
