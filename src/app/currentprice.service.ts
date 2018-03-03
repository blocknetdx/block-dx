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
  public currentprice: Observable<Currentprice>;
  public orderHistory: Observable<Currentprice[]>;

  constructor(private http: Http, private appService: AppService) {
    this.currentprice = this.getCurrentprice();
  }

  private getCurrentprice(): Observable<Currentprice> {

    return Observable.create(observer => {
      window.electron.ipcRenderer.on('currentPrice', (e, order) => {
        const preppedOrder = Object.assign({}, order, {
          last: order.close
        });
        observer.next(Currentprice.fromObject(preppedOrder));
      });
      window.electron.ipcRenderer.send('getCurrentPrice');

    });

  }

  getOrderHistory() {
    if(!this.orderHistory) {
      this.orderHistory = Observable.create(observer => {
        window.electron.ipcRenderer.on('orderHistory', (e, data) => {
          const preppedData = data
            .map(d => Object.assign({}, d, {
              last: d.close
            }))
            .map(d => Currentprice.fromObject(d));
          observer.next(preppedData);
        });
        window.electron.ipcRenderer.send('getOrderHistory');
      });
    }
    return this.orderHistory;
  }

  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error); // for demo purposes only
    return Promise.reject(error.message || error);
  }
}
