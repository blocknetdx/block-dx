import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';

import { Cryptocurrency } from './cryptocurrency';

@Injectable()
export class CryptocurrencyService {

  private currenciesObservable: Observable<Cryptocurrency[]>;
  private tokensObservable: Observable<Cryptocurrency[]>;

  constructor(private http: Http) { }

  public getCurrencyComparisons(token): Observable<Cryptocurrency[]> {
    const { ipcRenderer } = window.electron;
    return  Observable.create(observer => {
      try {

        ipcRenderer.on('currencyComparisons', (e, currencies) => {
          const preppedCurrencies = currencies
            .map(c => Cryptocurrency.fromObject(c));
          observer.next(preppedCurrencies);
        });
        ipcRenderer.send('getCurrencyComparisons', token);

      } catch (err) {
        console.error(err);
      }
    });
  }

  public getCurrencies(): Observable<Cryptocurrency[]> {

    const { ipcRenderer } = window.electron;

    // ipcRenderer.on('localTokens', (e, tokens) => {
    //   console.log('localTokens', tokens);
    // });
    // ipcRenderer.send('getLocalTokens');
    //
    // ipcRenderer.on('networkTokens', (e, tokens) => {
    //   console.log('networkTokens', tokens);
    // });
    // ipcRenderer.send('getNetworkTokens');


    if(!this.currenciesObservable) {
      this.currenciesObservable = Observable.create(observer => {
        try {

          ipcRenderer.on('currencies', (e, currencies) => {
            const preppedCurrencies = currencies
              .map(c => Cryptocurrency.fromObject(c));
            observer.next(preppedCurrencies);
          });
          ipcRenderer.send('getCurrencies');

        } catch(err) {
          console.error(err);
        }
      });
    }
    return this.currenciesObservable;

    // return this.http.get('api/currency').map((res: Response) => {
    //   const data = res.json();
    //   console.log('data', data);
    //   return data.map((c) => Cryptocurrency.fromObject(c));
    // });


  }

  /**
   * Returns All tokens both local and network.
   * @returns {Observable<Cryptocurrency[]>}
   */
  public getTokens(): Observable<Cryptocurrency[]> {
    const { ipcRenderer } = window.electron;
    if (!this.tokensObservable) {
      this.tokensObservable = Observable.create(observer => {
        try {
          let localTokens = null;
          let networkTokens = null;
          const checkDone = () => {
            if (!localTokens || !networkTokens)
              return;
            const tokens = localTokens.concat(networkTokens)
              .sort((a, b) => a.symbol.localeCompare(b.symbol));
            observer.next(tokens);
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
            checkDone();
          });

          ipcRenderer.send('getLocalTokens');
          ipcRenderer.send('getNetworkTokens');
        } catch(err) {
          console.error(err);
        }
      });
    }
    return this.tokensObservable;
  }

}
