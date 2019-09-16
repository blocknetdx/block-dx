import { Injectable } from '@angular/core';
import { Headers, Http } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';
import { Subject } from 'rxjs/Subject';
import * as math from 'mathjs';
import 'rxjs/add/operator/toPromise';
import 'rxjs/add/operator/map';
import { Order } from './order';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';

math.config({
  number: 'BigNumber',
  precision: 64
});

const { bignumber } = math;

declare var electron: any;

@Injectable()
export class OrderbookService {
  public requestedOrder: Subject<Order> = new Subject();
  public takenOrder: Subject<Order> = new Subject();

  private orderbookObservable: BehaviorSubject<Order>;
  private priceDecimalObservable: BehaviorSubject<string>;
  public priceDecimalObserver: BehaviorSubject<string>;

  private orderbookUrl = '';
  // private orderbookUrl = 'https://api-public.sandbox.gdax.com/products/ETH-BTC/book?level=2';

  constructor(private http: Http) { }

  requestOrder(order: any) {
    this.requestedOrder.next(order);
  }

  takeOrder(order: any) {
    this.takenOrder.next(order);
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

  getOrderbook(): BehaviorSubject<Order> {
    // this.orderbookUrl = 'api/orderbook_' + symbolsolejoin('_');

    if(!this.orderbookObservable) {

      this.orderbookObservable = new BehaviorSubject(new Order());

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
            return [a.price, a.size, a.orderId, a.total];
          }),
          bids: orderBook.bids.map(a => {
            return [a.price, a.size, a.orderId, a.total];
          }),
        });

        const p = Order.fromObject(orderBook);

        const asks = p.asks;
        const totalAskSize: number = asks.reduce((acc, curr) => {
          return acc + parseFloat(curr[1]);
        }, 0);

        for(const ask of asks) {
          // ask.push((parseFloat(ask[1]) / totalAskSize) * 100);
          ask.splice(-1, 0, String(math
            .chain(bignumber(ask[1]))
            .divide(bignumber(totalAskSize))
            .multiply(100)
            .done()
            .toNumber()
          ));
          ask.splice(-1, 0, 'ask');
        }

        const bids = p.bids;
        const totalBidSize = asks.reduce((acc, curr) => {
          return acc + parseFloat(curr[1]);
        }, 0);

        for(const bid of bids) {
          // bid.push((parseFloat(bid[1]) / totalBidSize) * 100);
          bid.splice(-1, 0, String(math
            .chain(bignumber(bid[1]))
            .divide(bignumber(totalBidSize))
            .multiply(100)
            .done()
            .toNumber()
          ));
          bid.splice(-1, 0, 'bid');
        }

        // console.log(p);

        this.orderbookObservable.next(p);

      });

      electron.ipcRenderer.send('getOrderBook');

    }
    return this.orderbookObservable;
  }

  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error); // for demo purposes only
    return Promise.reject(error.message || error);
  }
}
