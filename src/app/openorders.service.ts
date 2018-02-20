import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Headers, Http } from '@angular/http';

import 'rxjs/add/operator/toPromise';
import 'rxjs/add/operator/map';

import { Openorder } from './openorder';

// ToDo Connect openorders.service to data API.

@Injectable()
export class OpenordersService {
  private openordersUrl = '';

  constructor(private http: Http) { }

  getOpenorders(symbols:string[]): Observable<Openorder[]> {

    return Observable.create(observer => {
      try {

        window.electron.ipcRenderer.on('myOrders', (e, orders) => {
          const newOrders = orders
            .map(order => Openorder.createOpenOrder({
              id: order.id,
              price: order.takerSize,
              size: order.makerSize,
              product_id: '',
              side: 'buy',
              stp: '',
              type: order.type,
              time_in_force: '',
              post_only: '',
              created_at: order.updatedAt ? order.updatedAt : order.createdAt,
              fill_fees: '',
              filledSize: '',
              executed_value: '',
              status: order.status,
              settled: order.status === 'filled' ? true : false,
              canceled: order.status === 'canceled' ? true : false
            }));
          observer.next(newOrders);
        });
        window.electron.ipcRenderer.send('getMyOrders');

      } catch(err) {
        console.error(err);
      }
    });

    // const url = 'api/openorders_' + symbols.join("_");
    //
    // return this.http.get(url)
    //   .map(response => response.json() as Openorder[])
    //   .toPromise()
    //   .catch(this.handleError);
  }

  getFilledorders(symbols:string[]): Promise<Openorder[]> {
    const url = 'api/filledorders_' + symbols.join('_');

    return this.http.get(url)
      .map((res) => res.json() as Openorder[])
      .toPromise()
      .catch(this.handleError);
  }

  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error); // for demo purposes only
    return Promise.reject(error.message || error);
  }
}
