let electron;
if(window.electron) {
  // Angular doesn't allow us to ignore Electron in the bundling process and crashes with errors because
  // local modules (e.g. fs, path, etc.) are not able to be bundled in the app. So, we get around this by
  // requiring electron directly in index.html and accessing it in Angular via a global variable.
  electron = window.electron;
} else {
  // For windows outside of the main window, we can require electron directly
  electron = window.require('electron');
}
const { ipcRenderer, webFrame } = electron;
const $ = require('jquery');
const uuid = require('uuid');

const { platform } = process;
const maxZoom = 150;
const minZoom = 60;
const zoomIncrement = 10;

const getZoomFactor = () => {
  return parseInt((webFrame.getZoomFactor() * 100).toFixed(0), 10);
};
const setZoomFactor = (zoomFactor) => {
  zoomFactor = zoomFactor / 100;
  webFrame.setZoomFactor(zoomFactor);
  ipcRenderer.send('setZoomFactor', zoomFactor);
};

window.document.addEventListener('keydown', e => {
  const { key, ctrlKey, metaKey } = e;
  const ctrlCmd = platform === 'darwin' ? metaKey : ctrlKey;
  if(!ctrlCmd) return;
  const zoomFactor = getZoomFactor();
  if(zoomFactor < maxZoom && key === '=') { // zoom in
    e.preventDefault();
    ipcRenderer.send('ZOOM_IN');
  } else if(zoomFactor > minZoom && key === '-') { // zoom out
    e.preventDefault();
    ipcRenderer.send('ZOOM_OUT');
  } else if(key === '0') { // reset zoom
    e.preventDefault();
    ipcRenderer.send('ZOOM_RESET');
  }
});

let scrolling = false;
window.addEventListener('mousewheel', e => {
  if(!scrolling) {
    // @ts-ignore
    const { deltaY, ctrlKey, metaKey } = e;
    const ctrlCmd = platform === 'darwin' ? metaKey : ctrlKey;
    if(!ctrlCmd) return;
    e.preventDefault();
    const zoomFactor = getZoomFactor();
    scrolling = true;
    if(zoomFactor < maxZoom && deltaY < 0 ) { // zoom in
      ipcRenderer.send('ZOOM_IN');
    } else if(zoomFactor > minZoom && deltaY > 0) { // zoom out
      ipcRenderer.send('ZOOM_OUT');
    }
    setTimeout(() => {
      scrolling = false;
    }, 50);
  }
});

const showZoomLevel = percent => {
  const id = uuid.v4();
  const styles = 'opacity:.9;background-color:#fff;color:#000;width:70px;height:30px;line-height:30px;font-size:14px;text-align:center;position:fixed;right:0;top:0;z-index:10000;';
  const className = 'js-zoomLevelContainer';
  $(`.${className}`).remove();
  $('body').append(`<div id="${id}" class="${className}" style="${styles}">${percent.toFixed(0)}%</div>`);
  setTimeout(() => {
    $(`#${id}`).remove();
  }, 2000);
};

const applyZoomFactor = (e , zoomFactor) => {
  webFrame.setZoomFactor(zoomFactor);
  showZoomLevel(zoomFactor * 100);
};

ipcRenderer.on('ZOOM_IN', applyZoomFactor);
ipcRenderer.on('ZOOM_OUT', applyZoomFactor);
ipcRenderer.on('ZOOM_RESET', e => {
  applyZoomFactor(e, 1);
});
