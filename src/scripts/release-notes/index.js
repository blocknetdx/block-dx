const MarkdownIt = require('markdown-it');
const md = new MarkdownIt();
const { Localize } = require('../../../src-back/localize');
const { ipcRenderer } = require('electron');

Localize.initialize(ipcRenderer.sendSync('getUserLocale'), ipcRenderer.sendSync('getLocaleData'));

$(document).ready(() => {

  document.title = Localize.text('General Settings', 'releaseNotesWindow');

  $('#js-closeBtn').text(Localize.text('Close', 'universal').toUpperCase());

  const $outerFlexContainer = $('#js-outerFlexContainer');
  const setContainerHeight = () => {
    $outerFlexContainer.css({
      width: window.innerWidth,
      height: window.innerHeight
    });

  };

  setContainerHeight();

  window.addEventListener('resize', setContainerHeight);

  // Get and display release notes text
  const $notesContainer = $('#js-notesContainer');
  const notes = ipcRenderer.sendSync('getReleaseNotes');
  const noNotesMessage = Localize.text('There are no notes to display.', 'releaseNotesWindow');
  if (!notes) {
    $notesContainer.html(`<p>${noNotesMessage}</p>`);
  } else {
    try {
      $notesContainer.html(md.render(notes));
    } catch (err) {
      alert(err);
      $notesContainer.html(`<p>${noNotesMessage}</p>`);
    }
  }

  // Set header and window title text
  const version = ipcRenderer.sendSync('getAppVersion');
  const headerText = Localize.text('Release Notes', 'releaseNotesWindow');
  document.title = `v${version} ${headerText}`;
  $('#js-header').text(`v${version} ${headerText.toUpperCase()}`);

  // Listener to open any link in browser
  $('a').on('click', e => {
    e.preventDefault();
    const href = $(e.currentTarget).attr('href');
    if(href && href !== '#') ipcRenderer.send('openExternal', href);
  });

  // Attach close window click event
  $('#js-closeBtn').on('click', e => {
    e.preventDefault();
    ipcRenderer.send('closeReleaseNotesWindow');
  });

});
