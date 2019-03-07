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
          let preppedBalances = balances
            .filter(c => {
              if (c.coin === 'Wallet')
                wallet = c;
              return c.coin !== 'Wallet';
            })
            .sort((a, b) => a.coin.localeCompare(b.coin));

          if (wallet)
            preppedBalances.splice(0, 0, wallet);

          // Instantiate Balance obj
          preppedBalances = preppedBalances.map(b => Balance.fromObject(b));
          observer.next(preppedBalances);
        });
        ipcRenderer.send('getBalances');
      });
    }
    return this.balancesObservable;

  }

}
