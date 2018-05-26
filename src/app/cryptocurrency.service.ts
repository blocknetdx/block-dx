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
   * Returns local tokens.
   * @returns {Observable<Cryptocurrency[]>}
   */
  public getTokens(): Observable<Cryptocurrency[]> {
    const { ipcRenderer } = window.electron;
    if (!this.tokensObservable) {
      this.tokensObservable = Observable.create(observer => {
        try {
          ipcRenderer.on('localTokens', (e, tokens) => {
            const preppedTokens = tokens
              .map(token => {
                const preppedToken = Cryptocurrency.fromObject({
                  symbol: token,
                  name: token,
                  last: 0,
                  change: 0,
                  local: true
                });
                return preppedToken;
              })
              .sort((a, b) => a.symbol.localeCompare(b.symbol));
            observer.next(preppedTokens);
          });
          ipcRenderer.send('getLocalTokens');
        } catch(err) {
          console.error(err);
        }
      });
    }
    return this.tokensObservable;
  }

}
