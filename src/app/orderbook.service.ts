import { Injectable } from '@angular/core';
import {Observable} from 'rxjs/Observable';
import { Headers, Http } from '@angular/http';

import 'rxjs/add/operator/toPromise';
import 'rxjs/add/operator/map';

import { Order } from './order';
// import { ORDERS } from './mock-orderbook';


@Injectable()
export class OrderbookService {

  private orderbookUrl = 'api/orderbook';  // URL to web api
  // private orderbookUrl = 'https://api-public.sandbox.gdax.com/products/BTC-USD/book?level=2';

  constructor(private http: Http) { }

  // getOrderbook(): Promise<Order[]> {
  //   return this.http.get(this.orderbookUrl)
  //              .toPromise()
  //              .then(response => response.json().data as Order[])
  //              .catch(this.handleError);
  // }

  getData(): Observable<Order[]> {
    return this.http.get(this.orderbookUrl).map((response) => response.json().data as Order[]);
  }

  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error); // for demo purposes only
    return Promise.reject(error.message || error);
  }
}
