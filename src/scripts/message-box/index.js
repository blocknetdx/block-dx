const { ipcRenderer } = require('electron');
const { ipcMainListeners } = require('../../../src-back/constants');

const { Localize } = require('../../../src-back/localize');
Localize.initialize(ipcRenderer.sendSync('getUserLocale'), ipcRenderer.sendSync('getLocaleData'));
const title = ipcRenderer.sendSync(ipcMainListeners.GET_MESSAGE_BOX_TITLE);
const message = ipcRenderer.sendSync(ipcMainListeners.GET_MESSAGE_BOX_MESSAGE);

$(document).ready(() => {

  document.title = title;

  $('#js-doNotAskAgainMessage').text(Localize.text('Do not show again.', 'unverifiedAssetWindow'));

  let notAskAgain = false;

  const windowHeader = title;
  const windowText = message;

  const confirmButtonText = Localize.text('OK', 'universal');
  $('#js-header').text(windowHeader);
  $('#js-label').text(windowText);
  $('#js-acceptBtn').text(confirmButtonText);

  $('#js-notAskAgain').on('click', e => {
    e.preventDefault();
    const icon = $('#js-notAskAgain').find('i');
    if(notAskAgain) {
      icon.addClass('fa-square');
      icon.removeClass('fa-check-square');
      notAskAgain = false;
    } else {
      icon.addClass('fa-check-square');
      icon.removeClass('fa-square');
      notAskAgain = true;
    }
    ipcRenderer.send(ipcMainListeners.SET_MESSAGE_BOX_NOT_SHOW_AGAIN, notAskAgain);
  });

  $('#js-acceptBtn').on('click', e => {
    e.preventDefault();
    ipcRenderer.send(ipcMainListeners.CLOSE_MESSAGE_BOX);
  });

});
