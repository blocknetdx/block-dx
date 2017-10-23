import { Injectable } from '@angular/core';

import { Headers, Http } from '@angular/http';

import 'rxjs/add/operator/toPromise';

import { Trade } from './trade';
// import { TRADES } from './mock-tradehistory';


@Injectable()
export class TradehistoryService {
  private currency1 = 'ETH';
  private currentpriceUrl = 'api/stats_' + this.currency1;  // URL to web api

  private tradehistoryUrl = 'api/tradehistory_' + this.currency1;  // URL to web api
  // private tradehistoryUrl = 'https://api-public.sandbox.gdax.com/products/BTC-USD/trades';

  constructor(private http: Http) { }

  getTradehistory(): Promise<Trade[]> {
    return this.http.get(this.tradehistoryUrl)
              .map((res) => {
                let p = res.json().data;
                let totalTradeSize = 0;

                for(var i = 0; i < p.length; i++) {
                  var currSize = parseFloat(p[i].size);
                  totalTradeSize += currSize;
                }

                for(var i = 0; i < p.length; i++) {
                  var currSize = parseFloat(p[i].size);
                  var percentTradeSize = (currSize/totalTradeSize)*100;
                  p[i].percent = percentTradeSize;
                }

                return res;
              })
              .toPromise()
              .then(response => response.json().data as Trade[])
              .catch(this.handleError);
  }

  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error); // for demo purposes only
    return Promise.reject(error.message || error);
  }
}
