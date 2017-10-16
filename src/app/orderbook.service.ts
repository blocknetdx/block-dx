import { Injectable } from '@angular/core';
import {Observable} from 'rxjs/Observable';
import { Headers, Http } from '@angular/http';

import 'rxjs/add/operator/toPromise';
import 'rxjs/add/operator/map';

import { Order } from './order';
// import { ORDERS } from './mock-orderbook';


@Injectable()
export class OrderbookService {
  private currency = 'ETH';

  private orderbookUrl = 'api/orderbook' + this.currency;  // URL to web api
  // private orderbookUrl = 'https://api-public.sandbox.gdax.com/products/BTC-USD/book?level=2';

  constructor(private http: Http) { }

  getOrderbook(): Promise<Order[]> {
    return this.http.get(this.orderbookUrl)
                .map((res) => {

                  ////////////////////////////////////////////////////////////////////////
                  // THIS IS NOT ELEGANT - FIX THIS!!! HAHA ~rsmith
                  ////////////////////////////////////////////////////////////////////////

                  let p = res.json().data;
                  let totalAskSize = 0;
                  var asks = p[0].asks;

                  for(var i = 0; i < asks.length; i++) {
                    var currSize = parseFloat(asks[i][1]);
                    totalAskSize += currSize;
                  }

                  for(var i = 0; i < asks.length; i++) {
                    var currSize = parseFloat(asks[i][1]);
                    var percentTradeSize = (currSize/totalAskSize)*100;
                    asks[i][4] = percentTradeSize;
                  }

                  ////////////////////////////////////////////////////////////////////////

                  let totalBidSize = 0;
                  var bids = p[0].bids;

                  for(var i = 0; i < bids.length; i++) {
                    var currSize = parseFloat(bids[i][1]);
                    totalBidSize += currSize;
                  }

                  for(var i = 0; i < bids.length; i++) {
                    var currSize = parseFloat(bids[i][1]);
                    var percentTradeSize = (currSize/totalBidSize)*100;
                    bids[i][4] = percentTradeSize;
                  }

                  ////////////////////////////////////////////////////////////////////////
                  ////////////////////////////////////////////////////////////////////////


                  return res;
                })
               .toPromise()
               .then(response => response.json().data as Order[])
               .catch(this.handleError);
  }

  // getOrderbook(): Observable<Order[]> {
  //   return this.http
  //     .get(this.orderbookUrl)
  //     .map((response) => response.json().data as Order[]);
  // }

  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error); // for demo purposes only
    return Promise.reject(error.message || error);
  }
}
