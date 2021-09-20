import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';

import { Balance } from './balance';

@Injectable()
export class OrderformService {

  private resetOrderformObservable: Subject<void>;

  constructor() { }

  public getResetOrderForm(): Subject<void> {
    if(!this.resetOrderformObservable) {
      this.resetOrderformObservable = new Subject();
    }
    return this.resetOrderformObservable;
  }

}
