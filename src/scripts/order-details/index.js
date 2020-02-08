const { ipcRenderer } = require('electron');

const { Localize } = require('../../../src-back/localize');
Localize.initialize(ipcRenderer.sendSync('getUserLocale'), ipcRenderer.sendSync('getLocaleData'));

$(document).ready(() => {

  document.title = Localize.text('Order Details', 'orderDetailsWindow');

  $('#js-orderDetailsHeader').text(Localize.text('Order Details', 'orderDetailsWindow').toUpperCase());

  const details = ipcRenderer.sendSync('getOrderDetails');

  for(const [ label, value ] of details) {
    $('#js-detailsContainer').append(`
          <div class="input-group">
            <label>${label}</label>
            <input type="text" value="${value}" readonly />
          </div>
        `);
  }

});
