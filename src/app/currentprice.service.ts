import { Injectable } from '@angular/core';
import { Headers, Http } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/debounceTime';

import { AppService } from './app.service';
import { Currentprice } from './currentprice';

@Injectable()
export class CurrentpriceService {
  public currentprice: BehaviorSubject<Currentprice> = new BehaviorSubject(null);

  private currentpriceUrl: string = '';  // URL to web api

  constructor(private http: Http, private appService: AppService) {
    this.appService.marketPairChanges.subscribe((symbols) => {
      if (symbols) {
        this.getCurrentprice(symbols).first().subscribe((cp) => {
          this.currentprice.next(cp);
        });
      }
    });
  }

  private getCurrentprice(symbols:string[]): Observable<Currentprice> {
    this.currentpriceUrl = 'api/stats_' + symbols[0];

    return this.http.get(this.currentpriceUrl)
      .map((res) => {
        const data = res.json().map(d => {
          return Currentprice.fromObject(d);
        });
        return data[0];
      })
      .debounceTime(5000)
      .catch(this.handleError);
  }

  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error); // for demo purposes only
    return Promise.reject(error.message || error);
  }
}
