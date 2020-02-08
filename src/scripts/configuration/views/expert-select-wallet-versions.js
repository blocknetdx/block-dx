/* global Localize */

const { Set } = require('immutable');
const { RouterView } = require('../../modules/router');
const route = require('../constants/routes');
const configurationTypes = require('../constants/configuration-types');
const titles = require('../modules/titles');
const footerButtons = require('../snippets/footer-buttons');
const sidebar = require('../snippets/sidebar');
const { compareByVersion } = require('../util');

class ExpertSelectWalletVersions extends RouterView {

  constructor(options) {
    super(options);
  }

  onBeforeMount(state) {

    const configurationType = state.get('configurationType');
    const addingWallets = configurationType === configurationTypes.ADD_NEW_WALLETS;
    const updatingWallets = configurationType === configurationTypes.UPDATE_WALLETS;
    const selectedListName = addingWallets ? 'addAbbrs' : updatingWallets ? 'updateAbbrs' : 'selectedAbbrs';
    const selectedIdListName = addingWallets ? 'addWallets' : updatingWallets ? 'updateWallets' : 'selectedWallets';
    const selectedList = state.get(selectedIdListName);

    let abbrToVersion = new Map();
    const wallets = state.get('wallets');
    for(const w of wallets) {
      if(selectedList.has(w.versionId) && w.version) {
        abbrToVersion = abbrToVersion.set(w.abbr, w.version);
      }
    }

    const selectedAbbrs = state.get(selectedListName);
    const filteredWallets = [...wallets]
      .filter(w => selectedAbbrs.has(w.abbr))
      .reduce((arr, w) => {
        const idx = arr.findIndex(ww => ww.abbr === w.abbr);
        if(idx > -1) { // coin is already in array
          arr[idx].versions = [...arr[idx].versions, ...w.versions];
          return arr;
        } else {
          return [...arr, w.set({})];
        }
      }, [])
      .map(w => {
        w.versions.sort(compareByVersion);
        if(abbrToVersion.has(w.abbr)) {
          w.version = abbrToVersion.get(w.abbr);
        } else {
          w.version = w.versions[0];
        }
        return w;
      });

    for(const wallet of filteredWallets) {
      const { abbr, version } = wallet;
      const idx = wallets.findIndex(w => w.abbr === abbr && w.versions.includes(version));
      wallets[idx].version = version;
    }

    state.set('filteredWallets', filteredWallets);
    state.set(addingWallets ? 'addWallets' : updatingWallets ? 'updateWallets' : 'selectedWallets', new Set(filteredWallets.map(f => {
      const { abbr, version } = f;
      const wallet = wallets.find(w => w.abbr === abbr && w.versions.includes(version));
      return wallet.versionId;
    })));
  }

  render(state) {

    const { $target } = this;

    const styles = {
      p: 'margin-top:0;padding-top:0;padding-left:10px;padding-right:10px;margin-bottom:10px;',
      bottomP: 'margin-top:10px;padding-top:0;padding-left:10px;padding-right:10px;margin-bottom:-5px;'
    };

    const items = [...state.get('filteredWallets')]
      .map(w => {
        return `
              <div class="main-area-item2">
                <div style="display:flex;flex-direction:row:flex-wrap:nowrap;justify-content:space-between;">
                  <div>${w.name}</div>
                </div>
                <div class="input-group" style="margin-bottom:0;margin-top:10px;">
                  <label style="flex-basis:0;flex-grow:1;">${Localize.text('Wallet Version','configurationWindowExpertVersions')}</label>
                  <div class="js-versionDropdownButton dropdown-button" data-abbr="${w.abbr}" style="flex-basis:0;flex-grow:1;position:relative;">
                    <div style="margin-left:10px;">${w.version}</div>
                    <div><i class="fas fa-angle-down radio-icon" style="margin-right:0;font-size:20px;"></i></div>
                  </div>
                </div>
              </div>
              <div style="height:1px;"></div>
            `;
      })
      .join('\n');

    const configurationType = state.get('configurationType');
    let title;
    if(configurationType === configurationTypes.ADD_NEW_WALLETS) {
      title = titles.ADD_WALLET_EXPERT_CONFIGURATION();
    } else if(configurationType === configurationTypes.UPDATE_WALLETS) {
      title = titles.UPDATE_WALLET_EXPERT_CONFIGURATION();
    } else {
      title = titles.FRESH_SETUP_EXPERT_CONFIGURATION();
    }

    const html = `
          <h3>${title}</h3>
          <div class="container">
            <div class="flex-container">
              <div class="col1">
                ${sidebar(0)}
              </div>
              <div class="col2">

                <p style="${styles.p}">${Localize.text('Please select the wallet version installed for each of the following assets. <strong>DO NOT</strong> use any wallet versions not listed here. They have either not been tested yet or are not compatible.','configurationWindowExpertVersions')}</p>
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
    const { $ } = this;

    $('#js-backBtn').on('click', e => {
      e.preventDefault();
      router.goTo(route.SELECT_WALLETS);
    });

    $('#js-continueBtn').on('click', e => {
      e.preventDefault();
      router.goTo(route.SELECT_WALLET_DIRECTORIES);
    });

    $('.js-versionDropdownButton').on('click', e => {
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
      const versions = state.get('filteredWallets').find(w => w.abbr === abbr).versions;
      const $icon = $target.find('i');
      if($icon.hasClass('fa-angle-down')) { // dropdown currently closed

        const height = $target.outerHeight();
        const width = $target.outerWidth();

        closeDropdowns(() => {

          $icon.addClass('fa-angle-up');
          $icon.removeClass('fa-angle-down');

          $target.append(`
            <div class="js-dropdownMenu" style="z-index:1000;position:absolute;top:${height}px;left:0;background-color:#ddd;width:${width}px;max-height:162px;overflow-y:auto;">
              ${versions.map(v => `<div class="js-dropdownMenuItem dropdown-button" data-version="${v}"><div>${v}</div></div>`).join('')}
            </div>
          `);

          setTimeout(() => {
            $('.js-dropdownMenuItem')
              .off('click')
              .on('click', ee => {
                ee.preventDefault();

                const configurationType = state.get('configurationType');
                const addingWallets = configurationType === configurationTypes.ADD_NEW_WALLETS;
                const updatingWallets = configurationType === configurationTypes.UPDATE_WALLETS;

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

                const selectedListName = addingWallets ? 'addWallets' : updatingWallets ? 'updateWallets' : 'selectedWallets';

                let selectedWallets = state.get(selectedListName);
                for(const w of wallets) {
                  if(w.abbr === abbr) selectedWallets = selectedWallets.delete(w.versionId);
                }
                selectedWallets = selectedWallets.add(versionId);
                state.set(selectedListName, selectedWallets);
              });
          }, 0);
        });

      } else { // dropdown currently open
        closeDropdowns();
      }
    });

  }

}

module.exports = ExpertSelectWalletVersions;
