const MarkdownIt = require('markdown-it');
const md = new MarkdownIt();

$(document).ready(() => {

  const $outerFlexContainer = $('#js-outerFlexContainer');
  const setContainerHeight = () => {
    $outerFlexContainer.css({
      width: window.innerWidth,
      height: window.innerHeight
    });

  };

  setContainerHeight();

  window.addEventListener('resize', setContainerHeight);

  const {ipcRenderer} = require('electron');
  const { shell } = require('electron').remote;

  // Get and display release notes text
  const $notesContainer = $('#js-notesContainer');
  const notes = ipcRenderer.sendSync('getReleaseNotes');
  const noNotesMessage = 'There are no notes to display.';
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
  document.title = `v${version} Release Notes`;
  $('#js-header').text(`v${version} RELEASE NOTES`);

  // Listener to open any link in browser
  $('a').on('click', e => {
    e.preventDefault();
    const href = $(e.currentTarget).attr('href');
    if(href && href !== '#') shell.openExternal(href);
  });

  // Attach close window click event
  $('#js-closeBtn').on('click', e => {
    e.preventDefault();
    ipcRenderer.send('closeReleaseNotesWindow');
  });

});
