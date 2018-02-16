import { Injectable } from '@angular/core';
import { Headers, Http } from '@angular/http';
import * as rx from 'rxjs';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { ipcRenderer } from 'electron';

import 'rxjs/add/operator/toPromise';
import 'rxjs/add/operator/map';

import { Order } from './order';
import { Trade } from './trade';

declare var electron: any;

@Injectable()
export class AppDataService {
  public requestedOrder: Subject<Order> = new Subject();

  constructor() { }

  requestOrder(order: Order) {
    this.requestedOrder.next(order);
  }

  getOrderbook(symbols:string[]): Observable<Order> {
    this.orderbookUrl = 'api/orderbook_' + symbols.join('_');

    // ToDo Connect orderbook.service to data API

    return rx.Observable.create(observer => {
      try {

        electron.ipcRenderer.on('orderBook', (e, orderBook) => {

          orderBook = Object.assign({}, orderBook, {
            asks: orderBook.asks.map(a => {
              return [a.price, a.size, a.orderId];
            }),
            bids: orderBook.bids.map(a => {
              return [a.price, a.size, a.orderId];
            }),
          });

          const p = Order.fromObject(orderBook);

          const asks = p.asks;
          const totalAskSize = asks.reduce((acc, curr) => {
            return acc + parseFloat(curr[1]);
          }, 0);

          for(const ask of asks) {
            ask.push((parseFloat(ask[1]) / totalAskSize) * 100);
            ask.push('ask');
          }

          const bids = p.bids;
          const totalBidSize = asks.reduce((acc, curr) => {
            return acc + parseFloat(curr[1]);
          }, 0);

          for(const bid of bids) {
            bid.push((parseFloat(bid[1]) / totalBidSize) * 100);
            bid.push('bid');
          }

          observer.next(p);

        });

        electron.ipcRenderer.send('getOrderBook');

      } catch(err) {
        console.error(err);
      }
    });
  }

  getTradehistory(symbols:string[]): Observable<Trade[]> {

    // ToDo Connect tradehistory.service to data API.

    return rx.Observable.create(observer => {
      try {

        electron.ipcRenderer.on('tradeHistory', (e, tradeHistory, keyPair) => {

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
            return acc + parseFloat(curr.size);
          }, 0);

          for(const trade of p) {
            trade.percent = (parseFloat(trade.size) / totalTradeSize) * 100;
          }

          observer.next(p);

        });

        electron.ipcRenderer.send('getTradeHistory');

      } catch(err) {
        console.error(err);
      }
    });

  }
  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error); // for demo purposes only
    return Promise.reject(error.message || error);
  }
}
