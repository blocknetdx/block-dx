import { Injectable } from '@angular/core';

import { Headers, Http } from '@angular/http';

import 'rxjs/add/operator/toPromise';

import { Currentprice } from './currentprice';


@Injectable()
export class CurrentpriceService {
  private currency1 = 'ETH';
  private currentpriceUrl = 'api/stats_' + this.currency1;  // URL to web api

  constructor(private http: Http) { }

  getCurrentprice(): Promise<Currentprice[]> {
    return this.http.get(this.currentpriceUrl)
              // .map((res) => {
              //   console.log(res);
              //   return res;
              // })
              .toPromise()
              .then(response => response.json().data as Currentprice[])
              .catch(this.handleError);
  }

  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error); // for demo purposes only
    return Promise.reject(error.message || error);
  }
}
