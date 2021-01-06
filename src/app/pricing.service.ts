import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { Pricing } from './pricing';

@Injectable()
export class PricingService {

  private pricingEnabledObservable: BehaviorSubject<boolean>;
  private pricingObservable: BehaviorSubject<Pricing>;

  constructor() { }

  /**
   * Returns if pricing is enabled or not
   * @returns {Observable<boolean>}
   */
  public getPricingEnabled(): BehaviorSubject<boolean> {
    if(!this.pricingEnabledObservable) {

      const { ipcRenderer } = window.electron;

      this.pricingEnabledObservable = new BehaviorSubject(false);

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
  public getPricing(): BehaviorSubject<Pricing> {
    if(!this.pricingObservable) {

      const { ipcRenderer } = window.electron;

      this.pricingObservable = new BehaviorSubject(new Pricing([]));

      ipcRenderer.on('pricingMultipliers', (e, items) => {
        const pricing = new Pricing(items);
        this.pricingObservable.next(pricing);
      });
      ipcRenderer.send('getPricing');
    }
    return this.pricingObservable;
  }

}
