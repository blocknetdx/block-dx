import { Injectable } from '@angular/core';
import { Headers, Http } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import * as rx from 'rxjs/Rx';
import * as math from 'mathjs';

math.config({
  number: 'BigNumber',
  precision: 64
});

import 'rxjs/add/operator/toPromise';

import { Trade } from './trade';

declare var electron: any;

@Injectable()
export class TradehistoryService {
  // private tradehistoryUrl = '';  // URL to web api
  // private tradehistoryUrl = 'https://api-public.sandbox.gdax.com/products/BTC-USD/trades';

  constructor(private http: Http) { }

  getTradehistory(): Observable<Trade[]> {
    // this.tradehistoryUrl = 'api/tradehistory_' + symbols.join('_');

    return rx.Observable.create(observer => {
      try {

        electron.ipcRenderer.on('tradeHistory', (e, tradeHistory, keyPair) => {

          // console.log('tradehistory', tradeHistory);

          const p = tradeHistory
            .map(h => {

              const side = h.maker === keyPair[0] ? 'buy' : 'sell';

              return {
                time: h.time || new Date().toISOString(),
                trade_id: h.id,
                price: side === 'buy' ? h.takerSize : h.makerSize,
                size: side === 'buy' ? h.makerSize : h.takerSize,
                side
              };
            })
            .map(t => Trade.fromObject(t));

          const totalTradeSize = p.reduce((acc, curr) => {
            // return acc + parseFloat(curr.size);
            return math.add(acc, parseFloat(curr.size));
          }, 0);

          for(const trade of p) {
            // trade.percent = (parseFloat(trade.size) / totalTradeSize) * 100;
            trade.percent = math
              .chain(parseFloat(trade.size))
              .divide(totalTradeSize)
              .multiply(100)
              .done();
          }

          observer.next(p);

        });

        electron.ipcRenderer.send('getTradeHistory');

      } catch(err) {
        console.error(err);
      }
    });

    // return this.http.get(this.tradehistoryUrl)
    //   .map((res) => {
    //     let p = res.json().map(data => Trade.fromObject(data));
    //
    //     const totalTradeSize = p.reduce((acc, curr) => {
    //       return acc + parseFloat(curr.size);
    //     }, 0);
    //
    //     p.forEach(trade => {
    //       trade.percent = (parseFloat(trade.size)/totalTradeSize)*100;
    //     });
    //
    //     return p;
    //   });
  }

  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error); // for demo purposes only
    return Promise.reject(error.message || error);
  }
}
