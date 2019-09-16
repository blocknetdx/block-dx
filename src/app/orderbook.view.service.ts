import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import {Cryptocurrency} from './cryptocurrency';
import { OrderbookViews } from './enums';

@Injectable()
export class OrderbookViewService {

  constructor() { }

  private orderbookViewObservable: BehaviorSubject<OrderbookViews>;

  public orderbookView(): BehaviorSubject<OrderbookViews> {
    if(!this.orderbookViewObservable) {
      this.orderbookViewObservable = new BehaviorSubject(OrderbookViews.ALL);
    }
    return this.orderbookViewObservable;
  }

}
