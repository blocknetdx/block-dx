import { Injectable } from '@angular/core';
import { Headers, Http } from '@angular/http';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Subject } from 'rxjs/Subject';
import * as moment from 'moment';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/debounceTime';
import { AppService } from './app.service';
import { Currentprice } from './currentprice';

@Injectable()
export class CurrentpriceService {
  public currentprice: Subject<Currentprice>;
  public orderHistory: BehaviorSubject<Currentprice[]>;
  public orderHistoryByMinute: BehaviorSubject<Currentprice[]>;
  public orderHistoryBy15Minutes: BehaviorSubject<Currentprice[]>;
  public orderHistoryBy1Hour: BehaviorSubject<Currentprice[]>;
  private _onPair: BehaviorSubject<any>;

  constructor(private http: Http, private appService: AppService) {
    this.currentprice = this.getCurrentprice();
    window.electron.ipcRenderer.on('currentPrice', (e, order) => {
      this.currentprice.next(Currentprice.fromObject(order));
    });
    window.electron.ipcRenderer.send('getCurrentPrice');
  }

  private getCurrentprice(): Subject<Currentprice> {
    return new Subject();
  }

  getOrderHistoryByMinute() {
    if(!this.orderHistoryByMinute) {

      this.orderHistoryByMinute = new BehaviorSubject([]);

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

        this.orderHistoryByMinute.next(preppedData);
      });
      window.electron.ipcRenderer.send('getOrderHistoryByMinute');
    }
    return this.orderHistoryByMinute;
  }

  getOrderHistoryBy15Minutes() {
    if(!this.orderHistoryBy15Minutes) {

      this.orderHistoryBy15Minutes = new BehaviorSubject([]);

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

        this.orderHistoryBy15Minutes.next(preppedData);
      });
      window.electron.ipcRenderer.send('getOrderHistoryBy15Minutes');
    }
    return this.orderHistoryBy15Minutes;
  }

  getOrderHistoryBy1Hour() {
    if(!this.orderHistoryBy1Hour) {

      this.orderHistoryBy1Hour = new BehaviorSubject([]);

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

        this.orderHistoryBy1Hour.next(preppedData);
      });
      window.electron.ipcRenderer.send('getOrderHistoryBy1Hour');
    }
    return this.orderHistoryBy1Hour;
  }

  getOrderHistory() {
    if(!this.orderHistory) {

      this.orderHistory = new BehaviorSubject([]);

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

        this.orderHistory.next(preppedData);
      });
      window.electron.ipcRenderer.send('getOrderHistory');
    }
    return this.orderHistory;
  }

  onPair() {
    if(!this._onPair) {
      const { ipcRenderer } = window.electron;
      const keyPair = ipcRenderer.sendSync('getKeyPairSync');
      this._onPair = new BehaviorSubject(keyPair);
      window.electron.ipcRenderer.on('keyPair', (e, pair) => {
        this._onPair.next(pair);
      });
    }
    return this._onPair;
  }

  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error); // for demo purposes only
    return Promise.reject(error.message || error);
  }
}
