import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

@Injectable()
export class AppService {

  public marketPairChanges: BehaviorSubject<string[]>;

  constructor() {

    const { ipcRenderer } = window.electron;

    const initialPair = ipcRenderer.sendSync('getKeyPairSync');
    this.marketPairChanges = new BehaviorSubject(initialPair);

    ipcRenderer.on('keyPair', (e, pair) => {
      this.marketPairChanges.next(pair);
    });

    ipcRenderer.send('getKeyPair');
  }

  public updateMarketPair(pair: string[]) {
    const { ipcRenderer } = window.electron;
    ipcRenderer.send('setKeyPair', pair);
  }

}
