import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';

import { Cryptocurrency } from './cryptocurrency';

@Injectable()
export class CryptocurrencyService {

  private currenciesObservable: Observable<Cryptocurrency[]>;

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

}
