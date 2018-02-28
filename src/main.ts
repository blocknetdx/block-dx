import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

String.prototype['capitalize'] = function() {
  return this.charAt(0).toUpperCase() + this.slice(1);
};

if (environment.production) {
  enableProdMode();
}

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.log(err));

window.electron.ipcRenderer.on('error', (e, { name, message }) => {
  alert(name + ': ' + message);
});
