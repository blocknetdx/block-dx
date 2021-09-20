import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import * as math from 'mathjs';

math.config({
  number: 'BigNumber',
  precision: 64
});

const { bignumber } = math;

import 'rxjs/add/operator/toPromise';

import { Trade } from './trade';
import {logger} from './modules/logger';

declare var electron: any;

@Injectable()
export class TradehistoryService {

  private tradeHistoryObservable: BehaviorSubject<Trade[]>;

  constructor() { }

  getTradehistory(): Observable<Trade[]> {

    if(!this.tradeHistoryObservable) {

      this.tradeHistoryObservable = new BehaviorSubject([]);

      // Test Data Generator
      // try {
      //   const getRandom = (min, max) => Math.random() * (max - min) + min;
      //   let p = [];
      //   for (let i = 0; i < 30; i++) {
      //     p.push({
      //       time: new Date().toISOString(),
      //       trade_id: `trade${i}`,
      //       price: getRandom(1, 4),
      //       size: getRandom(1, 4),
      //       side: i % 2 === 0 ? 'buy' : 'sell'
      //     });
      //   }
      //   p = p.map(t => Trade.fromObject(t));
      //   const totalTradeSize = p.reduce((acc, curr) => {
      //     // return acc + parseFloat(curr.size);
      //     return math.add(acc, parseFloat(curr.size));
      //   }, 0);
      //   for (const trade of p) {
      //     // trade.percent = (parseFloat(trade.size) / totalTradeSize) * 100;
      //     trade.percent = math
      //       .chain(parseFloat(trade.size))
      //       .divide(totalTradeSize)
      //       .multiply(100)
      //       .done();
      //   }
      //   this.tradeHistoryObservable.next(p);
      // } catch(err) {
      // }

      electron.ipcRenderer.on('tradeHistory', (e, tradeHistory, keyPair) => {

        const p = tradeHistory
          .map(h => {

            const side = h.maker === keyPair[0] ? 'buy' : 'sell';

            return Trade.fromObject({
              time: h.time || new Date().toISOString(),
              trade_id: h.id,
              price: side === 'buy' ? h.takerSize : h.makerSize,
              size: side === 'buy' ? h.makerSize : h.takerSize,
              side
            });
          });

        const totalTradeSize = p.reduce((acc, curr) => {
          // return acc + parseFloat(curr.size);
          return math.add(bignumber(acc), bignumber(curr.size));
        }, 0);

        for(const trade of p) {
          // trade.percent = (parseFloat(trade.size) / totalTradeSize) * 100;
          trade.percent = math
            .chain(parseFloat(trade.size))
            .divide(totalTradeSize)
            .multiply(100)
            .done();
        }

        this.tradeHistoryObservable.next(p);

      });

      electron.ipcRenderer.send('getTradeHistory');
    }
    return this.tradeHistoryObservable;

  }

  private handleError(error: any): Promise<any> {
    logger.error(error.message + '\n' + error.stack);
    return Promise.reject(error.message || error);
  }
}
