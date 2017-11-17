import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

@Injectable()
export class AppService {

  public marketPairChanges: BehaviorSubject<string[]> = new BehaviorSubject(null);

  constructor() { }

  public updateMarketPair(pair: string[]) {
    this.marketPairChanges.next(pair);
  }
}
