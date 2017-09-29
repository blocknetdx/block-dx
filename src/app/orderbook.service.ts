import { Injectable } from '@angular/core';

import { Headers, Http } from '@angular/http';

import 'rxjs/add/operator/toPromise';

import { Order } from './order';
// import { TRADES } from './mock-tradehistory';


@Injectable()
export class OrderbookService {

  private orderbookUrl = 'api/orderbook';  // URL to web api

  constructor(private http: Http) { }

  getOrderbook(): Promise<Order[]> {
    return this.http.get(this.orderbookUrl)
               .toPromise()
               .then(response => response.json().data as Order[])
               .catch(this.handleError);
  }

  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error); // for demo purposes only
    return Promise.reject(error.message || error);
  }
}
