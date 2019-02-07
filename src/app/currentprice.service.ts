import { Injectable } from '@angular/core';
import { Headers, Http } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import * as moment from 'moment';

import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/debounceTime';

import { AppService } from './app.service';
import { Currentprice } from './currentprice';

@Injectable()
export class CurrentpriceService {
  public currentprice: Observable<Currentprice>;
  public orderHistory: Observable<Currentprice[]>;
  public orderHistoryByMinute: Observable<Currentprice[]>;
  public orderHistoryBy15Minutes: Observable<Currentprice[]>;
  public orderHistoryBy1Hour: Observable<Currentprice[]>;
  private _onPair: Observable<any>;

  constructor(private http: Http, private appService: AppService) {
    this.currentprice = this.getCurrentprice();
  }

  private getCurrentprice(): Observable<Currentprice> {

    return Observable.create(observer => {
      window.electron.ipcRenderer.on('currentPrice', (e, order) => {
        observer.next(Currentprice.fromObject(order));
      });
      window.electron.ipcRenderer.send('getCurrentPrice');

    });

  }

  getOrderHistoryByMinute() {
    if(!this.orderHistoryByMinute) {
      this.orderHistoryByMinute = Observable.create(observer => {
        window.electron.ipcRenderer.on('orderHistoryByMinute', (e, data) => {

          // Generate test data
          // data = [];
          // const getRandom = (min, max) => Math.random() * (max - min) + min;
          // const now = moment();
          // for(let i = 0; i > -1; i--) {
          //   for(let j = 23; j > -1; j--) {
          //     for(let k = 59; k > -1; k--) {
          //       const time = moment(now.toDate()).subtract(i, 'days').subtract(j, 'hours').subtract(k, 'minutes').toISOString();
          //       const low = getRandom(10, 40);
          //       const high = getRandom(low, 42);
          //       const close = getRandom(low, high);
          //       data.push({
          //         close,
          //         high,
          //         low,
          //         open: data[data.length - 1] ? data[data.length - 1].close : getRandom(10, 42),
          //         time,
          //         volume: getRandom(.1, .5),
          //       });
          //     }
          //   }
          // }

          const preppedData = data
            .map(d => Currentprice.fromObject(d));

          observer.next(preppedData);
        });
        window.electron.ipcRenderer.send('getOrderHistoryByMinute');
      });
    }
    return this.orderHistoryByMinute;
  }

  getOrderHistoryBy15Minutes() {
    if(!this.orderHistoryBy15Minutes) {
      this.orderHistoryBy15Minutes = Observable.create(observer => {
        window.electron.ipcRenderer.on('orderHistoryBy15Minutes', (e, data) => {

          // Generate test data
          // data = [];
          // const getRandom = (min, max) => Math.random() * (max - min) + min;
          // const now = moment();
          // for(let i = 0; i > -1; i--) {
          //   for(let j = 23; j > -1; j--) {
          //     for(let k = 3; k > -1; k--) {
          //       const time = moment(now.toDate()).subtract(i, 'days').subtract(j, 'hours').subtract(k * 15, 'minutes').toISOString();
          //       const low = getRandom(10, 40);
          //       const high = getRandom(low, 42);
          //       const close = getRandom(low, high);
          //       data.push({
          //         close,
          //         high,
          //         low,
          //         open: data[data.length - 1] ? data[data.length - 1].close : getRandom(10, 42),
          //         time,
          //         volume: getRandom(.1, .5),
          //       });
          //     }
          //   }
          // }

          const preppedData = data
            .map(d => Currentprice.fromObject(d));

          observer.next(preppedData);
        });
        window.electron.ipcRenderer.send('getOrderHistoryBy15Minutes');
      });
    }
    return this.orderHistoryBy15Minutes;
  }

  getOrderHistoryBy1Hour() {
    if(!this.orderHistoryBy1Hour) {
      this.orderHistoryBy1Hour = Observable.create(observer => {
        window.electron.ipcRenderer.on('orderHistoryBy1Hour', (e, data) => {

          // Generate test data
          // data = [];
          // const getRandom = (min, max) => Math.random() * (max - min) + min;
          // const now = moment();
          // for(let i = 0; i > -1; i--) {
          //   for(let j = 23; j > -1; j--) {
          //     for(let k = 1; k > -1; k--) {
          //       const time = moment(now.toDate()).subtract(i, 'days').subtract(j, 'hours').subtract(k * 30, 'minutes').toISOString();
          //       const low = getRandom(10, 40);
          //       const high = getRandom(low, 42);
          //       const close = getRandom(low, high);
          //       data.push({
          //         close,
          //         high,
          //         low,
          //         open: data[data.length - 1] ? data[data.length - 1].close : getRandom(10, 42),
          //         time,
          //         volume: getRandom(.1, .5),
          //       });
          //     }
          //   }
          // }

          const preppedData = data
            .map(d => Currentprice.fromObject(d));

          observer.next(preppedData);
        });
        window.electron.ipcRenderer.send('getOrderHistoryBy1Hour');
      });
    }
    return this.orderHistoryBy1Hour;
  }

  getOrderHistory() {
    if(!this.orderHistory) {
      this.orderHistory = Observable.create(observer => {
        window.electron.ipcRenderer.on('orderHistory', (e, data) => {

          // Generate test data
          // data = [];
          // const getRandom = (min, max) => Math.random() * (max - min) + min;
          // const now = moment();
          // for(let i = 0; i > -1; i--) {
          //   for(let j = 23; j > -1; j--) {
          //     for(let k = 59; k > -1; k--) {
          //       const time = moment(now.toDate()).subtract(i, 'days').subtract(j, 'hours').subtract(k, 'minutes').toISOString();
          //       const low = getRandom(10, 40);
          //       const high = getRandom(low, 42);
          //       const close = getRandom(low, high);
          //       data.push({
          //         close,
          //         high,
          //         low,
          //         open: data[data.length - 1] ? data[data.length - 1].close : getRandom(10, 42),
          //         time,
          //         volume: getRandom(.1, .5),
          //       });
          //     }
          //   }
          // }

          const preppedData = data
            .filter(d => d.high > 0 && d.low > 0)
            .map(d => Currentprice.fromObject(d));

          observer.next(preppedData);
        });
        window.electron.ipcRenderer.send('getOrderHistory');
      });
    }
    return this.orderHistory;
  }

  onPair() {
    if(!this._onPair) {
      this._onPair = Observable.create(observer => {
        window.electron.ipcRenderer.on('keyPair', (e, pair) => {
          observer.next(pair);
        });
      });
    }
    return this._onPair;
  }

  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error); // for demo purposes only
    return Promise.reject(error.message || error);
  }
}
