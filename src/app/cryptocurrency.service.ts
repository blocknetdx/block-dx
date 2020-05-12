import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { Cryptocurrency } from './cryptocurrency';

@Injectable()
export class CryptocurrencyService {

  private currenciesObservable: BehaviorSubject<Cryptocurrency[]>;
  private tokensObservable: BehaviorSubject<Cryptocurrency[]>;
  private currencyComparisonsObservable: BehaviorSubject<Cryptocurrency[]>;

  constructor(private http: Http) { }

  public getCurrencyComparisons(token): BehaviorSubject<Cryptocurrency[]> {

    const { ipcRenderer } = window.electron;

    if(!this.currencyComparisonsObservable) {
      this.currencyComparisonsObservable = new BehaviorSubject([]);
      ipcRenderer.on('currencyComparisons', (e, currencies) => {
        const preppedCurrencies = currencies
          .map(c => Cryptocurrency.fromObject(c));
        this.currencyComparisonsObservable.next(preppedCurrencies);
      });
      ipcRenderer.send('getCurrencyComparisons', token);
    }
    return this.currencyComparisonsObservable;
  }

  public getCurrencies(): BehaviorSubject<Cryptocurrency[]> {
    if(!this.currenciesObservable) {

      const { ipcRenderer } = window.electron;

      this.currenciesObservable = new BehaviorSubject([]);

      ipcRenderer.on('currencies', (e, currencies) => {
        const preppedCurrencies = currencies
          .map(c => Cryptocurrency.fromObject(c));
        this.currenciesObservable.next(preppedCurrencies);
      });
      ipcRenderer.send('getCurrencies');
    }
    return this.currenciesObservable;
  }

  /**
   * Returns All tokens both local and network.
   * @returns {Observable<Cryptocurrency[]>}
   */
  public getTokens(): BehaviorSubject<Cryptocurrency[]> {
    if (!this.tokensObservable) {

      const { ipcRenderer } = window.electron;

      this.tokensObservable = new BehaviorSubject([]);

      let localTokens = null;
      let networkTokens = null;

      const checkDone = () => {
        if (!localTokens || !networkTokens)
          return;
        const tokens = localTokens.concat(networkTokens)
          .sort((a, b) => a.symbol.localeCompare(b.symbol));
        this.tokensObservable.next(tokens);
      };

      ipcRenderer.on('localTokens', (e, tokens) => {
        localTokens = tokens
          .map(token => {
            const preppedToken = Cryptocurrency.fromObject({
              symbol: token,
              name: token,
              last: 0,
              change: 0,
              local: true
            });
            return preppedToken;
          });
        checkDone();
      });

      ipcRenderer.on('networkTokens', (e, tokens) => {

        networkTokens = tokens
          .map(token => {
            const preppedToken = Cryptocurrency.fromObject({
              symbol: token,
              name: token,
              last: 0,
              change: 0,
              local: false
            });
            return preppedToken;
          });

        // Unverified coins for testing purposes
        // const unverifiedCoins = [
        //   Cryptocurrency.fromObject({
        //     symbol: 'TEST',
        //     name: 'Test',
        //     last: 0,
        //     change: 0,
        //     local: false
        //   }),
        //   Cryptocurrency.fromObject({
        //     symbol: 'DANK',
        //     name: 'Dank',
        //     last: 0,
        //     change: 0,
        //     local: false
        //   }),
        //   Cryptocurrency.fromObject({
        //     symbol: 'MEMES',
        //     name: 'Memes',
        //     last: 0,
        //     change: 0,
        //     local: false
        //   }),
        // ];
        // networkTokens = networkTokens.concat(unverifiedCoins);

        checkDone();
      });

      ipcRenderer.send('getLocalTokens');
      ipcRenderer.send('getNetworkTokens');
    }
    return this.tokensObservable;
  }

}
