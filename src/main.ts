import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

window.electron.ipcRenderer.setMaxListeners(0);

String.prototype['capitalize'] = function() {
  return this.charAt(0).toUpperCase() + this.slice(1);
};

if (environment.production) {
  enableProdMode();
}

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.log(err));

let alertTimeout;
let count = 0;
window.electron.ipcRenderer.on('error', (e, { name, message }) => {
  if(count === 0) {
    count++;
    alert(name + ': ' + message);
    alertTimeout = setTimeout(() => {
      count = 0;
    }, 15000);
  } else if(count === 1) {
    count++;
    alert(name + ': ' + message);
  }
  if (name === 'Unsupported Version')
    window.electron.ipcRenderer.send('quitResetFirstRun');
});

window.document.addEventListener('drop', e => {
  e.preventDefault();
  e.stopPropagation();
});
window.document.addEventListener('dragover', e => {
  e.preventDefault();
  e.stopPropagation();
});
