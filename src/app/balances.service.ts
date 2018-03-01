import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { Balance } from './balance';

@Injectable()
export class BalancesService {

  private balancesObservable: Observable<Balance[]>;

  constructor() {
    console.log('Constructing BalancesService');
  }

  public getBalances(): Observable<Balance[]> {

    const { ipcRenderer } = window.electron;

    if(!this.balancesObservable) {
      this.balancesObservable = Observable.create(observer => {
        ipcRenderer.on('balances', (e, balances) => {
          const preppedBalances = balances
            .sort((a, b) => a.coin.localeCompare(b.coin))
            .map(b => Balance.fromObject(b));
          observer.next(preppedBalances);
        });
        ipcRenderer.send('getBalances');
      });
    }
    return this.balancesObservable;

  }

}
