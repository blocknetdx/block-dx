import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Subject } from 'rxjs/Subject';

import { Pricing } from './pricing';

@Injectable()
export class PricingService {

  private pricingEnabledObservable: Subject<boolean>;
  private pricingObservable: Subject<Pricing>;

  constructor(private http: Http) { }

  /**
   * Returns if pricing is enabled or not
   * @returns {Observable<boolean>}
   */
  public getPricingEnabled(): Subject<boolean> {
    if(!this.pricingEnabledObservable) {

      const { ipcRenderer } = window.electron;

      this.pricingEnabledObservable = new Subject();

      ipcRenderer.on('marketPricingEnabled', (e, enabled) => {
        this.pricingEnabledObservable.next(enabled);
      });
      ipcRenderer.send('getMarketPricingEnabled');
    }
    return this.pricingEnabledObservable;
  }

  /**
   * Returns pricing objects
   * @returns {Observable<Pricing[]>}
   */
  public getPricing(): Subject<Pricing> {
    if(!this.pricingObservable) {

      const { ipcRenderer } = window.electron;

      this.pricingObservable = new Subject();

      ipcRenderer.on('pricingMultipliers', (e, items) => {
        const pricing = new Pricing(items);
        this.pricingObservable.next(pricing);
      });
      ipcRenderer.send('getPricing');
    }
    return this.pricingObservable;
  }

}
