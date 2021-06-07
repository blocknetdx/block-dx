const { ipcRenderer } = require('electron');

const { Localize } = require('../../../src-back/localize');
Localize.initialize(ipcRenderer.sendSync('getUserLocale'), ipcRenderer.sendSync('getLocaleData'));

$(document).ready(() => {

  document.title = Localize.text('Order Details', 'orderDetailsWindow');

  $('#js-orderDetailsHeader').text(Localize.text('Order Details', 'orderDetailsWindow').toUpperCase());

  const details = ipcRenderer.sendSync('getOrderDetails');
  const showDeleteButton = ipcRenderer.sendSync('getShowDeleteButton');
  if(showDeleteButton) {
    const $deleteOrderButton = $('#js-deleteOrderButton');
    $deleteOrderButton.show();
    $deleteOrderButton.on('click', e => {
      e.preventDefault();
      const confirmed = confirm(Localize.text('Are you sure that you want to cancel this order?', 'openorders'));
      if(confirmed) {
        const found = details.find(([key]) => /^id$/i.test(key));
        if(found) {
          ipcRenderer.send('cancelOrder', found[1]);
          window.close();
        }
      }
    });
  }

  for(const [ label, value ] of details) {
    $('#js-detailsContainer').append(`
          <div class="input-group">
            <label>${label}</label>
            <input type="text" value="${value}" readonly />
          </div>
        `);
  }

});
