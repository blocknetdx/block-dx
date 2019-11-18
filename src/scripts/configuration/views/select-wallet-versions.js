/* global tippy */

const fs = require('fs-extra-promise');
const { Set } = require('immutable');
const { remote } = require('electron');
const { RouterView } = require('../../modules/router');
const route = require('../constants/routes');
const configurationTypes= require('../constants/configuration-types');
const titles = require('../constants/titles');
const { compareByVersion } = require('../util');

class SelectWalletVersions extends RouterView {

  constructor(options) {
    super(options);
  }

  onBeforeMount(state) {
    if(state.get('lookForWallets') === true) {
      const configurationType = state.get('configurationType');
      const wallets = state.get('wallets');

      const selectedAbbrs = state.get('selectedAbbrs');
      const addAbbrToVersion = state.get('addAbbrToVersion');

      const addingWallets = configurationType === configurationTypes.ADD_NEW_WALLETS;
      const updatingWallets = configurationType === configurationTypes.UPDATE_WALLETS;
      const updateAbbrToVersion = state.get('updateAbbrToVersion');

      let filteredWallets = [...wallets]
        .filter(w => {
          const dir = w.directory;
          try {
            fs.statSync(dir);
            return true;
          } catch(err) {
            return false;
          }
        })
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
          w.version = w.versions[0];
          return w;
        });

      if(addingWallets) {
        filteredWallets = filteredWallets
          .filter(w => !selectedAbbrs.has(w.abbr))
          .map(w => {
            const version = addAbbrToVersion.get(w.abbr);
            if(version) {
              w.version = version;
            }
            return w;
          });
        if(addAbbrToVersion.size === 0) {
          state.set('addAbbrToVersion', new Map(filteredWallets.map(w => [w.abbr, w.version])));
        }
      } else if(updatingWallets) {
        filteredWallets = filteredWallets
          .filter(w => selectedAbbrs.has(w.abbr))
          .map(w => {
            const version = updateAbbrToVersion.get(w.abbr);
            if(version) {
              w.version = version;
            }
            return w;
          });
      } else {
        state.set('selectedWallets', new Set(filteredWallets.map(f => {
          const { abbr, version } = f;
          const wallet = wallets.find(w => w.abbr === abbr && w.versions.includes(version));
          return wallet.versionId;
        })));
      }

      for(const wallet of filteredWallets) {
        const { abbr, version } = wallet;
        const idx = wallets.findIndex(w => w.abbr === abbr && w.versions.includes(version));
        wallets[idx].version = version;
      }

      state.set('filteredWallets', filteredWallets);
    }
  }

  render(state) {

    const { $target } = this;

    const styles = {
      p: 'margin-top:0;padding-top:0;margin-bottom:10px;',
      bottomP: 'margin-top:10px;padding-top:0;padding-left:10px;padding-right:10px;margin-bottom:-5px;'
    };

    const configurationType = state.get('configurationType');
    const addingWallets = configurationType === configurationTypes.ADD_NEW_WALLETS;
    const updatingWallets = configurationType === configurationTypes.UPDATE_WALLETS;

    const addAbbrToVersion = state.get('addAbbrToVersion');
    const updateAbbrToVersion = state.get('updateAbbrToVersion');
    const skipList = state.get('skipList');

    let allChecked = true;

    const items = [...state.get('filteredWallets')]
      .map(w => {
        const checked = addingWallets ? addAbbrToVersion.has(w.abbr) : updatingWallets ? updateAbbrToVersion.has(w.abbr) : skipList.has(w.abbr);
        if(!checked) allChecked = false;
        return `
              <div class="main-area-item2">
                <div style="display:flex;flex-direction:row:flex-wrap:nowrap;justify-content:space-between;">
                  <div>${w.name}</div>
                  <div style="display:${!updatingWallets && w.abbr === 'BLOCK' ? 'none' : 'block'};"><small><a class="js-skipBtn" href="#" data-abbr="${w.abbr}" data-version="${w.version}"><i class="far ${checked ? 'fa-check-square' : 'fa-square'} check-icon" /></a> ${addingWallets ? 'Add Wallet' : updatingWallets ? 'Update wallet' : 'Skip'}</small></div>
                </div>
                <div class="input-group" style="margin-bottom:0;margin-top:10px;">
                  <label style="flex-basis:0;flex-grow:1;">Wallet Version</label>
                  <div class="js-versionDropdownButton dropdown-button" data-abbr="${w.abbr}" data-version="${w.version}" style="flex-basis:0;flex-grow:1;position:relative;">
                    <div style="margin-left:10px;">${w.version}</div>
                    <div><i class="fas fa-angle-down radio-icon" style="margin-right:0;font-size:20px;"></i></div>
                  </div>
                </div>
              </div>
              <div style="height:1px;"></div>
            `;
      })
      .join('\n');

    const noFoundMessage = 'Unable to automatically detect installed wallets that haven\'t been configured already. If you haven\'t already installed the wallet you would like to connect, please do that first. If you are using a custom data directory you will need to go BACK and select Expert Setup. If you would like to configure a wallet you already have configured you will need to go BACK and select Update Wallet.';

    let title;
    if(addingWallets) {
      title = titles.ADD_WALLET_QUICK_CONFIGURATION;
    } else if(updatingWallets) {
      title = titles.UPDATE_WALLET_QUICK_CONFIGURATION;
    } else {
      title = titles.FRESH_SETUP_QUICK_CONFIGURATION;
    }

    const disableContinue = addingWallets && addAbbrToVersion.size === 0 ? true : updatingWallets && updateAbbrToVersion.size === 0 ? true : false;

    const html = `
          <h3>${title}</h3>
          <div class="container">
            <div class="flex-container">
              <div class="col2-no-margin">
              
                <p style="${styles.p}">Please select the wallet version installed for each of the following assets. <strong>DO NOT</strong> use any wallet versions not listed here. They have either not been tested yet or are not compatible.</p>
                <div class="select-all-outer-container">
                  <p class="js-selectWalletToContinue text-danger" style="display:${(addingWallets || updatingWallets) && disableContinue ? 'block' : 'none' };">Please select at least one wallet to continue.</p>
                  <p class="select-all-container"><a class="js-selectAll select-all-link" href="#"><i class="far ${allChecked ? 'fa-check-square' : 'fa-square'} check-icon" /> ${addingWallets ? 'Add' : updatingWallets ? 'Update' : 'Skip'} All</a></p>
                </div>
                <div id="js-mainConfigurationArea" class="main-area">
                  ${items.length > 0 ? items : `<div>${noFoundMessage}</div>`}
                </div>
                <div style="display:none;">
                <div class="js-tippyContent">
                  <ul style="text-align:left;">
                    ${!updatingWallets ? 
                      `<li>Lite wallets, online wallets, and Electrum wallets are not supported yet.</li>
                      <li>Not all assets are supported. <a class="js-supportedAssetsLink" href="#">See list of supported assets.</a></li>
                      <li>Quick Setup only checks default install locations. If using a custom install location, use Expert Setup.</li>`
                    :
                      `<li>The wallet might not be configured. Only wallets that have been configured can be updated. To add a new wallet, go BACK and choose the Add Wallet option.</li>
                      <li>Quick Setup only checks default install locations. If using a custom install location, use Expert Setup.</li>`
                    }
                  </ul>
                </div>
                </div>
                <div style="${styles.bottomP}">Don't see a wallet in the list? <sup><i class="fas fa-question-circle js-tippyTrigger" /></sup></div>
                
                <div id="js-buttonContainer" class="button-container">
                  <button id="js-backBtn" type="button" class="gray-button">BACK</button>
                  <button id="js-continueBtn" type="button" ${disableContinue ? 'disabled' : ''}>CONTINUE</button>
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
      router.goTo(route.SELECT_SETUP_TYPE);
    });

    $('#js-continueBtn').on('click', async function(e) {
      e.preventDefault();
      state.set('lookForWallets', false);
      router.goTo(route.FINISH);
    });

    const toggleCheck = $target => {
      const $icon = $target.find('i');
      const abbr = $target.attr('data-abbr');
      const version = $target.attr('data-version');
      const configurationType = state.get('configurationType');
      const addingWallets = configurationType === configurationTypes.ADD_NEW_WALLETS;
      const updatingWallets = configurationType === configurationTypes.UPDATE_WALLETS;
      let addAbbrToVersion = state.get('addAbbrToVersion');
      let updateAbbrToVersion = state.get('updateAbbrToVersion');
      let skipList = state.get('skipList');
      const $continueBtn = $('#js-continueBtn');
      const selectWalletMessage = $('.js-selectWalletToContinue');

      if(updatingWallets ? updateAbbrToVersion.has(abbr) : addingWallets ? addAbbrToVersion.has(abbr) : skipList.has(abbr)) {
        skipList = skipList.delete(abbr);
        $icon.addClass('fa-square');
        $icon.removeClass('fa-check-square');
        if(updatingWallets) {
          updateAbbrToVersion.delete(abbr);
          state.set('updateAbbrToVersion', updateAbbrToVersion);
          if(updateAbbrToVersion.size === 0) {
            selectWalletMessage.css('display', 'block');
            $continueBtn.prop('disabled', true);
          }
        } else if(addingWallets) {
          addAbbrToVersion.delete(abbr);
          state.set('addAbbrToVersion', addAbbrToVersion);
          if(addAbbrToVersion.size === 0) {
            selectWalletMessage.css('display', 'block');
            $continueBtn.prop('disabled', true);
          }
        }
      } else {
        skipList = skipList.add(abbr);
        $icon.addClass('fa-check-square');
        $icon.removeClass('fa-square');
        if(updatingWallets) {
          updateAbbrToVersion = updateAbbrToVersion.set(abbr, version);
          state.set('updateAbbrToVersion', updateAbbrToVersion);
        } else if(addingWallets) {
          addAbbrToVersion = addAbbrToVersion.set(abbr, version);
          state.set('addAbbrToVersion', addAbbrToVersion);
        }
        $continueBtn.prop('disabled', false);
        selectWalletMessage.css('display', 'none');
      }
      if(!updatingWallets) state.set('skipList', skipList);
    };

    $('.js-skipBtn').on('click', e => {
      e.preventDefault();
      const $target = $(e.currentTarget);
      toggleCheck($target);
      const $selectAllIcon = $('.js-selectAll').find('i');
      $selectAllIcon.addClass('fa-square');
      $selectAllIcon.removeClass('fa-check-square');
    });

    $('.js-selectAll').on('click', e => {
      e.preventDefault();

      const configurationType = state.get('configurationType');
      const updatingWallets = configurationType === configurationTypes.UPDATE_WALLETS;

      const skipBtns = $('.js-skipBtn');
      const items = [];
      for(const btn of skipBtns) {
        const $btn = $(btn);
        const abbr = $btn.attr('data-abbr');
        if(!updatingWallets && abbr === 'BLOCK') continue;
        const version = $btn.attr('data-version');
        const $icon = $btn.find('i');
        const checked = $icon.hasClass('fa-check-square');
        items.push({
          abbr,
          version,
          checked,
          $icon,
          $btn
        });
      }
      const $selectAllIcon = $(e.currentTarget).find('i');
      const allChecked = $selectAllIcon.hasClass('fa-check-square');
      if(allChecked) { // de-select all
        $selectAllIcon.addClass('fa-square');
        $selectAllIcon.removeClass('fa-check-square');
        for(const item of items) {
          toggleCheck(item.$btn);
        }
      } else { // select all
        $selectAllIcon.addClass('fa-check-square');
        $selectAllIcon.removeClass('fa-square');
        for(const item of items) {
          if(!item.checked) toggleCheck(item.$btn);
        }
      }
    });

    const { openExternal } = remote.shell;
    $('.js-supportedAssetsLink').on('click', e => {
      e.preventDefault();
      openExternal('https://docs.blocknet.co/blockdx/listings');
    });
    tippy($('.js-tippyTrigger')[0], {
      interactive: true,
      animateFill: false,
      theme: 'block',
      content: $('.js-tippyContent')[0]
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
                const v = $(ee.currentTarget).attr('data-version');

                const configurationType = state.get('configurationType');
                const addingWallets = configurationType === configurationTypes.ADD_NEW_WALLETS;
                const updatingWallets = configurationType === configurationTypes.UPDATE_WALLETS;

                const updateAbbrToVersion = state.get('updateAbbrToVersion');
                if(updatingWallets && updateAbbrToVersion.has(abbr)) {
                  updateAbbrToVersion.set(abbr, v);
                  state.set('updateAbbrToVersion', updateAbbrToVersion);
                }

                const addAbbrToVersion = state.get('addAbbrToVersion');
                if(addingWallets && addAbbrToVersion.has(abbr)) {
                  addAbbrToVersion.set(abbr, v);
                  state.set('addAbbrToVersion', addAbbrToVersion);
                }

                { // update filteredWallets
                  const filteredWallets = state.get('filteredWallets');
                  const idx = filteredWallets
                    .findIndex(w => w.abbr === abbr && w.versions.includes(v));
                  state.set('filteredWallets', [
                    ...filteredWallets.slice(0, idx),
                    filteredWallets[idx].set({version: v}),
                    ...filteredWallets.slice(idx + 1)
                  ]);
                }

                let versionId;
                { // update wallets
                  const idx = wallets
                    .findIndex(w => w.abbr === abbr && w.versions.includes(v));
                  state.set('wallets', [
                    ...wallets.slice(0, idx),
                    wallets[idx].set({version: v}),
                    ...wallets.slice(idx + 1)
                  ]);
                  versionId = wallets[idx].versionId;
                }
                $($target.find('div')[0]).text(v);

                const skipLink = $(`.js-skipBtn[data-abbr="${abbr}"]`);
                skipLink.attr('data-version', v);

                if(!updatingWallets) {
                  let selectedWallets = state.get('selectedWallets');
                  for(const w of wallets) {
                    if(w.abbr === abbr) selectedWallets = selectedWallets.delete(w.versionId);
                  }
                  selectedWallets = selectedWallets.add(versionId);
                  state.set('selectedWallets', selectedWallets);
                }

              });
          }, 0);
        });

      } else { // dropdown currently open
        closeDropdowns();
      }
    });

  }

}

module.exports = SelectWalletVersions;
