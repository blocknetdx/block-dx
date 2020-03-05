const { ipcRenderer } = require('electron');

const { Localize } = require('../../../src-back/localize');
Localize.initialize(ipcRenderer.sendSync('getUserLocale'), ipcRenderer.sendSync('getLocaleData'));

$(document).ready(() => {

  document.title = Localize.text('Unverified Asset', 'unverifiedAssetWindow');

  $('#js-doNotAskAgainMessage').text(Localize.text('Do not show again.', 'unverifiedAssetWindow'));

  let notAskAgain = false;

  const notVerified = ipcRenderer.sendSync('getUnverifiedAssets', []);

  const oneMessage = Localize.text('{token} is not a verified asset. Trading this asset may result in loss of funds.', 'pairSelector', {token: notVerified[0]});
  const twoMessage = Localize.text('{token0} and {token1} are not verified assets. Trading these assets may result in loss of funds.', 'pairSelector', {token0: notVerified[0], token1: notVerified[1]});

  const windowHeader = Localize.text('Unverified Asset', 'unverifiedAssetWindow');
  const windowText = notVerified.length === 1 ? oneMessage : twoMessage;
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
    ipcRenderer.send('setHideAssetWarning', notAskAgain);
  });

  $('#js-acceptBtn').on('click', e => {
    e.preventDefault();
    ipcRenderer.send('closeUnverifiedAssetWindow');
  });

});
