$(document).ready(() => {

  const MarkdownIt = require('markdown-it');
  const { ipcRenderer } = require('electron');

  const md = new MarkdownIt();

  const { Localize } = require('../../../src-back/localize');
  Localize.initialize(ipcRenderer.sendSync('getUserLocale'), ipcRenderer.sendSync('getLocaleData'));

  document.title = Localize.text('License Agreement', 'tosWindow');

  $('#js-licenseAgreementHeader').text(Localize.text('License Agreement', 'tosWindow').toUpperCase());
  $('#js-acceptBtn').text(Localize.text('Accept', 'tosWindow').toUpperCase());
  $('#js-cancelBtn').text(Localize.text('Cancel', 'tosWindow').toUpperCase());
  $('#js-closeBtn').text(Localize.text('Close', 'tosWindow').toUpperCase());

  const $outerFlexContainer = $('#js-outerFlexContainer');
  const setContainerHeight = () => {
    $outerFlexContainer.css({
      width: window.innerWidth,
      height: window.innerHeight
    });

  };

  setContainerHeight();

  window.addEventListener('resize', setContainerHeight);
  const tos = ipcRenderer.sendSync('getLocalizedTextBlock', 'tos');
  // const tos = ipcRenderer.sendSync('getTOS');
  $('#js-tosContainer').html(md.render(tos));

  const alreadyAccepted = ipcRenderer.sendSync('alreadyAccepted');
  if(!alreadyAccepted) { // not yet accepted
    $('#js-buttonContainer').css('display', 'flex');
  } else  { // already accepted
    $('#js-closeButtonContainer').css('display', 'flex');
  }

  const $cancelBtn = $('#js-cancelBtn');
  $cancelBtn.on('click', () => {
    ipcRenderer.send('cancelTOS');
  });

  const $acceptBtn = $('#js-acceptBtn');
  $acceptBtn.on('click', () => {
    $cancelBtn.attr('disabled', true);
    $acceptBtn.attr('disabled', true);
    ipcRenderer.send('acceptTOS');
  });

  $('#js-closeBtn').on('click', e => {
    e.preventDefault();
    ipcRenderer.send('closeTOS');
  });

});
