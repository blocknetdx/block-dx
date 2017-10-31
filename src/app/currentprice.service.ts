import { Injectable } from '@angular/core';

import { Headers, Http } from '@angular/http';

import 'rxjs/add/operator/toPromise';

import { Currentprice } from './currentprice';


@Injectable()
export class CurrentpriceService {
  private currentpriceUrl = '';  // URL to web api

  constructor(private http: Http) { }

  getCurrentprice(symbols:string[]): Promise<Currentprice[]> {
    this.currentpriceUrl = 'api/stats_' + symbols[0];

    return this.http.get(this.currentpriceUrl)
      .map((res) => {
        const data = res.json().data.map(d => {
          return Currentprice.fromObject(d);
        });
        return data;
      })
      .toPromise()
      .catch(this.handleError);
  }

  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error); // for demo purposes only
    return Promise.reject(error.message || error);
  }
}
