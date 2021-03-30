import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import * as math from 'mathjs';

import 'rxjs/add/operator/toPromise';
import 'rxjs/add/operator/map';

math.config({
  number: 'BigNumber',
  precision: 64
});

const { bignumber } = math;

import { Openorder } from './openorder';
import * as OrderStates from '../orderstates';
import {logger} from './modules/logger';

@Injectable()
export class OpenordersService {

  constructor() { }

  private ordersObservable: BehaviorSubject<Openorder[]>;

  getOpenorders(): BehaviorSubject<Openorder[]> {
    if(!this.ordersObservable) {

      const { ipcRenderer } = window.electron;

      this.ordersObservable = new BehaviorSubject([]);

      ipcRenderer.on('myOrders', (e, orders, symbols) => {
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
            const price = math.divide(bignumber(total), bignumber(size));

            return Openorder.createOpenOrder({
              id: order.id,
              maker,
              taker,
              partialMinimum: order.partialMinimum,
              price,
              size,
              total,
              product_id: '',
              side,
              stp: '',
              type: order.orderType,
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

        this.ordersObservable.next(newOrders);
      });
      window.electron.ipcRenderer.send('getMyOrders');
    }
    return this.ordersObservable;
  }

  private handleError(error: any): Promise<any> {
    logger.error(error.message + '\n' + error.stack);
    return Promise.reject(error.message || error);
  }
}
