/* global $, swal */

const { ipcRenderer } = require('electron');
const { dialog, shell, app } = require('electron').remote;
const renderSidebar = require('./modules/sidebar');
const renderIntroduction = require('./modules/introduction');
const renderFees = require('./modules/fees');
const renderListings = require('./modules/listings');
const renderFAQ = require('./modules/faq');
const renderTutorials = require('./modules/tutorials');
const renderSupport = require('./modules/support');
const renderBlocknet = require('./modules/blocknet');
const { Localize } = require('../../../src-back/localize');

Localize.initialize(ipcRenderer.sendSync('getUserLocale'), ipcRenderer.sendSync('getLocaleData'));

const handleError = err => {
  ipcRenderer.send('LOGGER_ERROR', err.message + '\n' + err.stack);
  alert(err);
};
window.onerror = handleError;


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


const gettingStartedText = Localize.text('Getting Started', 'informationWindow');
const feesText = Localize.text('Fees', 'informationWindow');

state.set('active', 0);
state.set('sidebarSelected', 0);
state.set('sidebarItems', [
  {sidebarText: gettingStartedText, title: gettingStartedText.toUpperCase()},
  {sidebarText: feesText, title: feesText.toUpperCase()},
  // {sidebarText: 'Listings', title: 'LISTINGS'},
  // {sidebarText: 'FAQ', title: 'FAQ'},
  // {sidebarText: 'Tutorials', title: 'TUTORIALS'},
  // {sidebarText: 'Troubleshooting', title: 'TROUBLESHOOTING'},
  {sidebarText: Localize.text('Powered by Blocknet', 'informationWindow'), title: Localize.text('Blocknet Protocol', 'informationWindow').toUpperCase()}
]);




$(document).ready(() => {

  document.title = Localize.text('Information', 'informationWindow');

  const render = () => {

    const sidebarItems = state.get('sidebarItems');
    const sidebarSelected = state.get('sidebarSelected');
    const active = state.get('active');

    const sidebarHTML = renderSidebar({ state, Localize });
    let mainHTML = '';

    switch(active) {
      case 0:
        mainHTML = renderIntroduction({ Localize });
        break;
      case 1:
        mainHTML = renderFees({ Localize });
        break;
      // case 4:
      //   mainHTML = renderListings();
      //   break;
      // case 4:
      //   mainHTML = renderFAQ();
      //   break;
      // case 4:
      //   mainHTML = renderTutorials();
      //   break;
      // case 4:
      //   mainHTML = renderSupport();
      //   break;
      case 2:
        mainHTML = renderBlocknet({ Localize });
        break;
      default:
        mainHTML = '';
    }


    const html = `
          <div class="container">
            <div class="flex-container">
              <div class="col1">
                ${sidebarHTML}
              </div>
              <div class="col2">
                <h3 class="title">${sidebarItems[sidebarSelected]['title']}</h3>
                ${mainHTML}
                <div id="js-buttonContainer" class="button-container">
                  <button id="js-closeBtn" type="button">${Localize.text('Close', 'universal').toUpperCase()}</button>
                </div>
              </div>
            </div>
          </div>
        `;

    $('#js-main').html(html);


    setTimeout(() => {
      $('#js-closeBtn').on('click', e => {
        e.preventDefault();
        ipcRenderer.send('closeInformationWindow');
      });

      $('.js-sidebarItem')
        .off('click')
        .on('click', e => {
          e.preventDefault();
          var newActive = Number($(e.target).attr("data-sidebar-index"));
          state.set('active', newActive);
          state.set('sidebarSelected', newActive);
          render();
      });

      $('.js-externalLink')
        .off('click')
        .on('click', e => {
          e.preventDefault();
          var url = $(e.target).attr("data-link");
          shell.openExternal(url);
        });

    }, 0);
  };


  (async function() {
    try {
      render();
    } catch(err) {
      handleError(err);
    }
  })();
});
