import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { Balance } from './balance';

@Injectable()
export class BalancesService {

  private balancesObservable: BehaviorSubject<Balance[]>;

  constructor() { }

  public getBalances(): BehaviorSubject<Balance[]> {
    if(!this.balancesObservable) {

      const { ipcRenderer } = window.electron;

      this.balancesObservable = new BehaviorSubject([]);

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
        this.balancesObservable.next(preppedBalances);
      });
      ipcRenderer.send('getBalances');
    }
    return this.balancesObservable;
  }

}
