import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Headers, Http } from '@angular/http';
import * as math from 'mathjs';

import 'rxjs/add/operator/toPromise';
import 'rxjs/add/operator/map';

math.config({
  number: 'BigNumber',
  precision: 64
});

import { Openorder } from './openorder';
import * as OrderStates from '../orderstates';

@Injectable()
export class OpenordersService {

  constructor(private http: Http) { }

  private ordersObservable: Observable<Openorder[]>;

  getOpenorders(): Observable<Openorder[]> {

    if(!this.ordersObservable) {
      this.ordersObservable = Observable.create(observer => {
        try {

          window.electron.ipcRenderer.on('myOrders', (e, orders, symbols) => {
            // // Test Data Generator
            // orders = [];
            // const getRandom = (min, max) => Math.random() * (max - min) + min;
            // for(let i = 0; i < 30; i++) {
            //   const price = getRandom(1, 4);
            //   const size = getRandom(1, 4);
            //   const status = i % 2 === 0 ? 'open' : OrderStates.Finished;
            //   const side = i % 3 === 0 ? 'sell' : 'buy';
            //   orders.push({
            //       id: `order${i}`,
            //       maker: side === 'buy' ? symbols[0] : symbols[1],
            //       taker: side === 'buy' ? symbols[1] : symbols[0],
            //       price,
            //       makerSize: String(size),
            //       takerSize: String(math.multiply(price, size)),
            //       type: 'exact',
            //       createdAt: new Date().toISOString(),
            //       status,
            //     });
            // }

            const newOrders = orders
              .map(order => {

                const side = order.maker === symbols[0] && order.taker === symbols[1] ? 'sell' : 'buy';

                let size, total, maker, taker;
                if(side === 'sell') {
                  maker = order.taker;
                  taker = order.maker;
                  size = order.makerSize;
                  total = order.takerSize;
                } else {
                  maker = order.maker;
                  taker = order.taker;
                  size = order.takerSize;
                  total = order.makerSize;
                }
                const price = math.divide(Number(total), Number(size));

                return Openorder.createOpenOrder({
                  id: order.id,
                  maker,
                  taker,
                  price,
                  size,
                  total,
                  product_id: '',
                  side,
                  stp: '',
                  type: order.type,
                  time_in_force: '',
                  post_only: '',
                  created_at: order.createdAt,
                  fill_fees: '',
                  filledSize: '',
                  executed_value: '',
                  status: order.status,
                  settled: order.status === OrderStates.Finished,
                  canceled: order.status === OrderStates.Canceled
                });
              })
              .sort((a, b) => b.created_at.localeCompare(a.created_at));

            // console.log('myOrders', newOrders);
            observer.next(newOrders);
          });
          window.electron.ipcRenderer.send('getMyOrders');

        } catch(err) {
          console.error(err);
        }
      });

    }
    return this.ordersObservable;

    // const url = 'api/openorders_' + symbols.join("_");
    //
    // return this.http.get(url)
    //   .map(response => response.json() as Openorder[])
    //   .toPromise()
    //   .catch(this.handleError);
  }

  // getFilledorders(symbols:string[]): Promise<Openorder[]> {
  //   const url = 'api/filledorders_' + symbols.join('_');
  //
  //   return this.http.get(url)
  //     .map((res) => res.json() as Openorder[])
  //     .toPromise()
  //     .catch(this.handleError);
  // }

  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error); // for demo purposes only
    return Promise.reject(error.message || error);
  }
}
