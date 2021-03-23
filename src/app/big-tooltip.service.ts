import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';

import { Balance } from './balance';

@Injectable()
export class BigTooltipService {

  private bigTooltipObservable: Subject<{tooltip: string, show: boolean}>;

  constructor() { }

  public bigTooltip(): Subject<{tooltip: string, show: boolean}> {
    if(!this.bigTooltipObservable) {
      this.bigTooltipObservable = new Subject();
    }
    return this.bigTooltipObservable;
  }

}
