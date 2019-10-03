const { ipcRenderer } = require('electron');

const { Localize } = require('../../../src-back/localize');
Localize.initialize(ipcRenderer.sendSync('getUserLocale'), ipcRenderer.sendSync('getLocaleData'));

$(document).ready(() => {

  document.title = Localize.text('Update Available', 'updateAvailableWindow');

  $('#js-doNotAskAgainMessage').text(Localize.text('Do not ask again (you can manually update later from the sidebar menu)', 'updateAvailableWindow'));

  let notAskAgain = false;
  const notAskAgainIcon = $('#js-notAskAgain').find('i').addClass(notAskAgain ? 'fa-check-square' : 'fa-square');

  const version = ipcRenderer.sendSync('getUpdateVersion');
  const windowType = ipcRenderer.sendSync('getUpdateWindowType'); // updateAvailable|updateDownloaded

  let windowHeader, windowText, confirmButtonText, cancelButtonText;

  switch(windowType) {
    case 'updateAvailable':
      windowHeader = Localize.text('Update Available!', 'updateAvailableWindow');
      windowText = Localize.text('Block DX version {version} is available! Would you like to download it now?', 'updateAvailableWindow', {version});
      confirmButtonText = Localize.text('Download Update', 'updateAvailableWindow');
      cancelButtonText = Localize.text('Not Now', 'updateAvailableWindow');
      break;
    case 'updateDownloaded':
      $('#js-notAskAgain').css('display', 'none');
      windowHeader = Localize.text('Block DX {version} Is Ready!', 'updateAvailableWindow', {version});
      windowText = Localize.text('Block DX {version} is almost ready to use! To complete the update, a restart is required.', 'updateAvailableWindow', {version});
      confirmButtonText = Localize.text('Restart Now', 'updateAvailableWindow');
      cancelButtonText = Localize.text('Cancel', 'updateAvaiableWindow');
  }

  $('#js-header').text(windowHeader);
  $('#js-label').text(windowText);
  $('#js-acceptBtn').text(confirmButtonText);
  $('#js-cancelBtn').text(cancelButtonText);

  const hideCheckbox = ipcRenderer.sendSync('hideCheckbox');
  const visibility = hideCheckbox ? 'hidden' : 'visible';
  $('#js-notAskAgain').css('visibility', visibility);

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
  });

  $('#js-acceptBtn').on('click', e => {
    e.preventDefault();
    if(windowType === 'updateAvailable') alert(Localize.text('The update is currently being downloaded. A prompt will appear when complete.', 'updateAvailableWindow'));
    ipcRenderer.send('accept');
  });
  $('#js-cancelBtn').on('click', e => {
    e.preventDefault();
    const icon = $('#js-notAskAgain').find('i');
    ipcRenderer.send('cancel', notAskAgain);
  });

});
