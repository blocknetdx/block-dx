import { Injectable } from '@angular/core';

import { Headers, Http } from '@angular/http';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/toPromise';

import { Trade } from './trade';
// import { TRADES } from './mock-tradehistory';

@Injectable()
export class TradehistoryService {
  private tradehistoryUrl = '';  // URL to web api
  // private tradehistoryUrl = 'https://api-public.sandbox.gdax.com/products/BTC-USD/trades';

  constructor(private http: Http) { }

  getTradehistory(symbols:string[]): Observable<Trade[]> {
    this.tradehistoryUrl = 'api/tradehistory_' + symbols.join("_");

    return this.http.get(this.tradehistoryUrl)
      .map((res) => {
        let p = res.json().data.map(data => Trade.fromObject(data));

        const totalTradeSize = p.reduce((acc, curr) => {
          return acc + parseFloat(curr.size);
        }, 0);

        p.forEach(trade => {
          trade.percent = (parseFloat(trade.size)/totalTradeSize)*100;
        });

        return p;
      });
  }

  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error); // for demo purposes only
    return Promise.reject(error.message || error);
  }
}
