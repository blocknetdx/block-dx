$(document).ready(() => {

  const { ipcRenderer } = require('electron');

  const $outerFlexContainer = $('#js-outerFlexContainer');
  const setContainerHeight = () => {
    $outerFlexContainer.css({
      width: window.innerWidth,
      height: window.innerHeight
    });

  };

  setContainerHeight();

  window.addEventListener('resize', setContainerHeight);
  const tos = ipcRenderer.sendSync('getTOS');
  $('#js-tosContainer').text(tos);

  const alreadyAccepted = ipcRenderer.sendSync('alreadyAccepted');
  if(!alreadyAccepted) { // not yet accepted
    $('#js-buttonContainer').css('display', 'flex');
  } else  { // already accepted
    $('#js-closeButtonContainer').css('display', 'flex');
  }

  const $cancelBtn = $('#js-cancelBtn');
  $cancelBtn.on('click', () => {
    console.log('canceled!');
    ipcRenderer.send('cancelTOS');
  });

  const $acceptBtn = $('#js-acceptBtn');
  $acceptBtn.on('click', () => {
    $cancelBtn.attr('disabled', true);
    $acceptBtn.attr('disabled', true);
    console.log('accepted!');
    ipcRenderer.send('acceptTOS');
  });

  $('#js-closeBtn').on('click', e => {
    e.preventDefault();
    ipcRenderer.send('closeTOS');
  });

});
