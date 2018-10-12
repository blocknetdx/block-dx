/* global $, swal */

const { ipcRenderer } = require('electron');

const renderSidebar = require('./modules/sidebar');
const renderPricing = require('./modules/pricing');

const handleError = err => {
  console.error(err);
  alert(err);
};

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

state.set('active', 0);
state.set('sidebarItems', [
  {text: 'Market Pricing'}
]);
state.set('pricingUnits', [
  'BTC'
]);
state.set('pricingSources', [
  {id: 'COIN_MARKET_CAP', text: 'CoinMarketCap'},
  {id: 'CRYPTO_COMPARE', text: 'CryptoCompare'}
]);

const saveSettings = () => {
  ipcRenderer.send('saveGeneralSettings', {
    pricingEnabled: state.get('pricingEnabled'),
    pricingSource: state.get('pricingSource'),
    apiKeys: state.get('apiKeys'),
    pricingUnit: state.get('pricingUnit'),
    pricingFrequency: state.get('pricingFrequency')
  });
};

$(document).ready(() => {

  const closeDropdowns = () => {
    const $target = $('#js-mainConfigurationArea');
    const $icons = $target.find('i.fa-angle-up');
    $target.find('.js-dropdownMenu').remove();
    $icons
      .addClass('fa-angle-down')
      .removeClass('fa-angle-up');
  };

  const render = () => {

    const active = state.get('active');
    const sidebarHTML = renderSidebar({ state });
    let mainHTML = '';
    switch(active) {
      case 0:
        mainHTML = renderPricing({ state });
        break;
      default:
        mainHTML = '';
    }

    const html = `
          <h3>GENERAL SETTINGS</h3>
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

      $('#js-main')
        .off('click')
        .on('click', e => {
          e.preventDefault();
          const $target = $(e.target);
          if(!$target.hasClass('js-versionDropdownButton') && !$target.parent().hasClass('js-versionDropdownButton') && !$target.parent().parent().hasClass('js-versionDropdownButton')) {
            closeDropdowns();
          }
        });

      $('#js-pricingUnitDropdown')
        .off('click')
        .on('click', e => {
          e.preventDefault();
          debugger;
          const $target = $(e.currentTarget);
          const $icon = $target.find('i');
          const pricingUnits = state.get('pricingUnits');
          const height = $target.outerHeight();
          const width = $target.outerWidth();
          if($icon.hasClass('fa-angle-up')) {
            closeDropdowns();
            return;
          }
          $icon.addClass('fa-angle-up');
          $icon.removeClass('fa-angle-down');
          $target.append(`
            <div class="js-dropdownMenu" style="z-index:1000;position:absolute;top:${height}px;left:0;background-color:#ddd;width:${width}px;max-height:162px;overflow-y:auto;">
              ${[...pricingUnits].sort((a, b) => a.localeCompare(b)).map(u => `<div class="js-dropdownMenuItem dropdown-button" data-unit="${u}"><div>${u}</div></div>`).join('')}
            </div>
          `);
          setTimeout(() => {
            $('.js-dropdownMenuItem')
              .off('click')
              .on('click', e => {
                e.preventDefault();
                const unit = $(e.currentTarget).attr('data-unit');
                $($target.find('div')[0]).text(unit);
                state.set('pricingUnit', unit);
                saveSettings();
              });
          }, 0);
        });
      $('#js-pricingSourceDropdown')
        .off('click')
        .on('click', e => {
          e.preventDefault();
          const $target = $(e.currentTarget);
          const $icon = $target.find('i');
          const pricingSources = state.get('pricingSources');
          const height = $target.outerHeight();
          const width = $target.outerWidth();
          if($icon.hasClass('fa-angle-up')) {
            closeDropdowns();
            return;
          }
          $icon.addClass('fa-angle-up');
          $icon.removeClass('fa-angle-down');
          $target.append(`
            <div class="js-dropdownMenu" style="z-index:1000;position:absolute;top:${height}px;left:0;background-color:#ddd;width:${width}px;max-height:162px;overflow-y:auto;">
              ${[...pricingSources].map(s => `<div class="js-dropdownMenuItem dropdown-button" data-source="${s.id}"><div>${s.text}</div></div>`).join('')}
            </div>
          `);
          setTimeout(() => {
            $('.js-dropdownMenuItem')
              .off('click')
              .on('click', ee => {
                ee.preventDefault();
                const source = $(ee.currentTarget).attr('data-source');
                const pricingSourceObj = pricingSources.find(p => p.id === source);
                $($target.find('div')[0]).text(pricingSourceObj.text);
                state.set('pricingSource', source);
                const apiKeys = state.get('apiKeys');
                let key;
                if(apiKeys[source]) {
                  key = apiKeys[source];
                } else {
                  key = '';
                  const newAPIKeys = Object.assign({}, apiKeys, {
                    [source]: key
                  });
                  state.set('apiKeys', newAPIKeys);
                }
                $('#js-apiKeyInput').val(key);
                saveSettings();
              });
          }, 0);
        });

      $('.js-colorToggle')
        .off('click')
        .on('click', e => {
          e.preventDefault();
          const $target = $(e.currentTarget);
          const $toggle1 = $target.find('.js-toggle1');
          const $toggle2 = $target.find('.js-toggle2');
          const $colorBar = $target.find('.js-colorBar');
          if($toggle1.hasClass('active')) {
            state.set('pricingEnabled', false);
            $toggle2.addClass('active');
            $toggle1.removeClass('active');
            $colorBar.addClass('color-bar-right');
            $colorBar.removeClass('color-bar-left');
          } else {
            state.set('pricingEnabled', true);
            $toggle1.addClass('active');
            $toggle2.removeClass('active');
            $colorBar.addClass('color-bar-left');
            $colorBar.removeClass('color-bar-right');
          }
          saveSettings();
        });

      $('#js-apiKeyInput')
        .off('change')
        .on('change', e => {
          e.preventDefault();
          const { value } = e.target;
          const pricingSource = state.get('pricingSource');
          const apiKeys = state.get('apiKeys');
          const newAPIKeys = Object.assign({}, apiKeys, {
            [pricingSource]: value.trim()
          });
          state.set('apiKeys', newAPIKeys);
          saveSettings();
        });

      $('#js-updateFrequencyInput')
        .off('change')
        .on('change', e => {
          e.preventDefault();
          const { value } = e.target;
          console.log('value', value);
          const preppedValue = Number(value) * 1000;
          state.set('pricingFrequency', preppedValue);
          saveSettings();
        });

    }, 0);
  };

  (async function() {
    try {
      const pricingEnabled = ipcRenderer.sendSync('getPricingEnabled');
      state.set('pricingEnabled', pricingEnabled);
      const pricingSource = ipcRenderer.sendSync('getPricingSource');
      state.set('pricingSource', pricingSource);
      const apiKeys = ipcRenderer.sendSync('getAPIKeys');
      state.set('apiKeys', apiKeys);
      const pricingUnit = ipcRenderer.sendSync('getPricingUnit');
      state.set('pricingUnit', pricingUnit);
      const pricingFrequency = ipcRenderer.sendSync('getPricingFrequency');
      state.set('pricingFrequency', pricingFrequency);

      render();
    } catch(err) {
      handleError(err);
    }
  })();
});
