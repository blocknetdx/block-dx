import { Injectable } from '@angular/core';

import { Headers, Http } from '@angular/http';

import 'rxjs/add/operator/toPromise';

import { Trade } from './trade';
// import { TRADES } from './mock-tradehistory';


@Injectable()
export class TradehistoryService {

  private tradehistoryUrl = 'api/tradehistory';  // URL to web api

  constructor(private http: Http) { }

  getTradehistory(): Promise<Trade[]> {
    return this.http.get(this.tradehistoryUrl)
               .toPromise()
               .then(response => response.json().data as Trade[])
               .catch(this.handleError);
  }

  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error); // for demo purposes only
    return Promise.reject(error.message || error);
  }

  // getTradehistory(): Promise<Trade[]> {
  //   return Promise.resolve(TRADES);
  // }
  //
  // getTradehistorySlowly(): Promise<Trade[]> {
  //   return new Promise(resolve => {
  //     // Simulate server latency with 2 second delay
  //     setTimeout(() => resolve(this.getTradehistory()), 2000);
  //   });
  // }
}
