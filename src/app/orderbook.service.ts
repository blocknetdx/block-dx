import { Injectable } from '@angular/core';
import { Headers, Http } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';
import { Subject } from 'rxjs/Subject';
import * as math from 'mathjs';

math.config({
  number: 'BigNumber',
  precision: 64
});

import 'rxjs/add/operator/toPromise';
import 'rxjs/add/operator/map';

import { Order } from './order';
// import { ORDERS } from './mock-orderbook';

declare var electron: any;

@Injectable()
export class OrderbookService {
  public requestedOrder: Subject<Order> = new Subject();

  private orderbookObservable: Observable<Order>;
  private priceDecimalObservable: Observable<string>;
  public priceDecimalObserver: Observer<string>;

  private orderbookUrl = '';
  // private orderbookUrl = 'https://api-public.sandbox.gdax.com/products/ETH-BTC/book?level=2';

  constructor(private http: Http) { }

  requestOrder(order: Order) {
    this.requestedOrder.next(order);
  }

  public setPriceDecimal(num: string) {
    localStorage.setItem('priceDecimal', num);
    this.priceDecimalObserver.next(num);
  }

  getPriceDecimal(): Observable<string> {
    if(!this.priceDecimalObservable) {
      this.priceDecimalObservable = Observable.create(observer => {
        this.priceDecimalObserver = observer;
        let priceDecimal = localStorage.getItem('priceDecimal');
        if(!priceDecimal) {
          priceDecimal = '6';
          localStorage.setItem('priceDecimal', priceDecimal);
        }
        observer.next(priceDecimal);
      });
    }
    return this.priceDecimalObservable;
  }

  getOrderbook(): Observable<Order> {
    // this.orderbookUrl = 'api/orderbook_' + symbolsolejoin('_');

    if(!this.orderbookObservable) {
      this.orderbookObservable = Observable.create(observer => {
        try {

          window.electron.ipcRenderer.on('orderBook', (e, orderBook) => {

            // Test Data Generator
            // const getRandom = (min, max) => Math.random() * (max - min) + min;
            // orderBook = {asks: [], bids: []};
            // for(let i = 0; i < 30; i++) {
            //   orderBook.asks.push([getRandom(1, 4), getRandom(1, 4), `ask${i}`]);
            //   orderBook.bids.push([getRandom(1, 4), getRandom(1, 4), `bid${i}`]);
            // }

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
            const totalAskSize: number = asks.reduce((acc, curr) => {
              return acc + parseFloat(curr[1]);
            }, 0);

            for(const ask of asks) {
              // ask.push((parseFloat(ask[1]) / totalAskSize) * 100);
              ask.push(math
                .chain(parseFloat(ask[1]))
                .divide(totalAskSize)
                .multiply(100)
                .done()
              );
              ask.push('ask');
            }

            const bids = p.bids;
            const totalBidSize = asks.reduce((acc, curr) => {
              return acc + parseFloat(curr[1]);
            }, 0);

            for(const bid of bids) {
              // bid.push((parseFloat(bid[1]) / totalBidSize) * 100);
              bid.push(math
                .chain(parseFloat(bid[1]))
                .divide(totalBidSize)
                .multiply(100)
                .done()
              );
              bid.push('bid');
            }

            // console.log(p);

            observer.next(p);

          });

          electron.ipcRenderer.send('getOrderBook');

        } catch(err) {
          console.error(err);
        }
      });

    }
    return this.orderbookObservable;

    /*return this.http.get(this.orderbookUrl)
      .map((res) => {

        ////////////////////////////////////////////////////////////////////////
        // THIS IS NOT ELEGANT - FIX THIS!!! HAHA ~rsmith
        ////////////////////////////////////////////////////////////////////////

        const raw = res.json()[0];
        const p = Order.fromObject(raw);

        const asks = p.asks;
        const totalAskSize = asks.reduce((acc, curr) => {
          return acc + parseFloat(curr[1]);
        }, 0);

        asks.forEach((ask) => {
          ask.push((parseFloat(ask[1])/totalAskSize)*100);
          ask.push('ask');
        });

        ////////////////////////////////////////////////////////////////////////

        const bids = p.bids;
        const totalBidSize = asks.reduce((acc, curr) => {
          return acc + parseFloat(curr[1]);
        }, 0);

        bids.forEach((bid) => {
          bid.push((parseFloat(bid[1])/totalBidSize)*100);
          bid.push('bid');
        });

        ////////////////////////////////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////


        return p;
      });*/
    //  .toPromise()
    //  .then(response => response.json() as Order[])
    //  .catch(this.handleError);
  }

  // getOrderbook(): Observable<Order[]> {
  //   return this.http
  //     .get(this.orderbookUrl)
  //     .map((response) => response.json() as Order[]);
  // }

  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error); // for demo purposes only
    return Promise.reject(error.message || error);
  }
}
