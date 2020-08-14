import { Localize } from './localize/localize.component';

export function naturalSort(arr:any[], key:any):any[] {
  let a, b, a1, b1, rx = /(\d+)|(\D+)/g, rd=/\d+/;
  return arr.sort((as,bs) => {
    a = String(eval('as.' + key)).toLowerCase().match(rx);
    b = String(eval('bs.' + key)).toLowerCase().match(rx);
    while(a.length && b.length) {
      a1 = a.shift();
      b1 = b.shift();
      if(rd.test(a1) || rd.test(b1)) {
        if(!rd.test(a1)) return 1;
        if(!rd.test(b1)) return -1;
        if(a1! = b1) return a1 - b1;
      } else if(a1! = b1) {
        return a1 > b1 ? 1 : -1;
      }
    }
    return a.length - b.length;
  });
}

export function debounce(func, wait, immediate?:boolean) {
  let timeout;
  return function() {
    const context = this, args = arguments;
    const later = function() {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
}

export const briefTimeout = (timeout = 0) => new Promise(resolve => setTimeout(resolve, timeout));

export const shouldHidePricing = (symbols: String[]): boolean => {
  return symbols.includes('BTC');
};

export const alert = message => {
  const { BrowserWindow, dialog } = window.electron.remote;
  dialog.showMessageBoxSync(BrowserWindow.getFocusedWindow(), {
    title: Localize.text('Alert', 'universal'),
    message,
    buttons: [
      Localize.text('OK', 'universal')
    ]
  });
};

export const confirm = message => {
  const { BrowserWindow, dialog } = window.electron.remote;
  const res = dialog.showMessageBoxSync(BrowserWindow.getFocusedWindow(), {
    title: Localize.text('Alert', 'universal'),
    message,
    buttons: [
      Localize.text('Cancel', 'universal'),
      Localize.text('OK', 'universal')
    ]
  });
  return res;
};
