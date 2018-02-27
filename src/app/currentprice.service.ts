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

  constructor(private http: Http, private appService: AppService) {
    console.log('constructing CurrentpriceService');
    this.appService.marketPairChanges.subscribe((symbols) => {
      if (symbols) {
        this.getCurrentprice(symbols).first().subscribe((cp) => {
          this.currentprice.next(cp);
        });
      }
    });
  }

  private getCurrentprice(symbols:string[]): Observable<Currentprice> {

    // ToDo Connect currentprice.service to data API

    return Observable.create(observer => {

      // window.electron.ipcRenderer.on('orderHistory', (e, orders) => {
      //   const preppedOrders = orders
      //     .sort((a, b) => a.time.localeCompare(b.time))
      //     .map(order => Object.assign(order, {last: order.close}))
      //     .map(Currentprice.fromObject);
      //   observer.next(preppedOrders[preppedOrders.length - 1]);
      // });
      // window.electron.ipcRenderer.send('getOrderHistory');

      window.electron.ipcRenderer.on('currentPrice', (e, order) => {
        const preppedOrder = Object.assign({}, order, {
          last: order.close
        });
        observer.next(Currentprice.fromObject(preppedOrder));
      });
      window.electron.ipcRenderer.send('getCurrentPrice');

    });

  }

  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error); // for demo purposes only
    return Promise.reject(error.message || error);
  }
}
