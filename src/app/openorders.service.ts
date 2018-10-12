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

@Injectable()
export class OpenordersService {
  private openordersUrl = '';

  constructor(private http: Http) { }

  private ordersObservable: Observable<Openorder[]>;

  private calculatePrice(order, symbols) {
    const firstPair = symbols[0];
    const makerSize = Number(order.makerSize);
    const takerSize = Number(order.takerSize);
    if(firstPair === order.maker) {
      return math.divide(takerSize, makerSize);
    } else {
      return math.divide(makerSize, takerSize);
    }
  }

  getOpenorders(): Observable<Openorder[]> {

    if(!this.ordersObservable) {
      this.ordersObservable = Observable.create(observer => {
        try {

          window.electron.ipcRenderer.on('myOrders', (e, orders, symbols) => {
            // console.log('myOrders', orders);
            const firstPair = symbols[0];

            // Test Data Generator
            // const getRandom = (min, max) => Math.random() * (max - min) + min;
            // const newOrders = [];
            // for(let i = 0; i < 30; i++) {
            //   const price = getRandom(1, 4);
            //   const size = getRandom(1, 4);
            //   const status = i % 2 === 0 ? 'open' : 'finished';
            //   newOrders.push(Openorder.createOpenOrder({
            //       id: `order${i}`,
            //       price,
            //       size,
            //       total: String(math.multiply(price, Number(size))),
            //       product_id: '',
            //       side: i % 2 === 0 ? 'sell' : 'buy',
            //       stp: '',
            //       type: 'exact',
            //       time_in_force: '',
            //       post_only: '',
            //       created_at: new Date().toISOString(),
            //       fill_fees: '',
            //       filledSize: '',
            //       executed_value: '',
            //       status,
            //       settled: status === 'finished',
            //       canceled: false
            //     }));
            // }

            const newOrders = orders
              .map(order => {

                const price = this.calculatePrice(order, symbols);
                const size = firstPair === order.maker ? order.makerSize : order.takerSize;

                return Openorder.createOpenOrder({
                  id: order.id,
                  price,
                  size,
                  total: String(math.multiply(price, Number(size))),
                  product_id: '',
                  side: firstPair === order.maker ? 'sell' : 'buy',
                  stp: '',
                  type: order.type,
                  time_in_force: '',
                  post_only: '',
                  created_at: order.updatedAt ? order.updatedAt : order.createdAt,
                  fill_fees: '',
                  filledSize: '',
                  executed_value: '',
                  status: order.status,
                  settled: order.status === 'finished',
                  canceled: order.status === 'canceled'
                });
              });
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
