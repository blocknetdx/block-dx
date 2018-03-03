import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { Balance } from './balance';

@Injectable()
export class BalancesService {

  private balancesObservable: Observable<Balance[]>;

  constructor() { }

  public getBalances(): Observable<Balance[]> {

    const { ipcRenderer } = window.electron;

    if(!this.balancesObservable) {
      this.balancesObservable = Observable.create(observer => {
        ipcRenderer.on('balances', (e, balances) => {
          let wallet;
          const preppedBalances = balances
            .filter(e => {
              if (e.coin === 'Wallet')
                wallet = e;
              return e.coin !== 'Wallet';
            })
            .sort((a, b) => a.coin.localeCompare(b.coin))
            .map(b => Balance.fromObject(b));
          if (wallet)
            preppedBalances.splice(0, 0, wallet);
          observer.next(preppedBalances);
        });
        ipcRenderer.send('getBalances');
      });
    }
    return this.balancesObservable;

  }

}
