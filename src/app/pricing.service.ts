import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';

import { Pricing } from './pricing';

@Injectable()
export class PricingService {

  private pricingEnabledObservable: Observable<boolean>;
  private pricingObservable: Observable<Pricing>;

  constructor(private http: Http) { }

  /**
   * Returns if pricing is enabled or not
   * @returns {Observable<boolean>}
   */
  public getPricingEnabled(): Observable<boolean> {
    const { ipcRenderer } = window.electron;
    if (!this.pricingEnabledObservable) {
      this.pricingEnabledObservable = Observable.create(observer => {
        try {
          ipcRenderer.on('marketPricingEnabled', (e, enabled) => {
            observer.next(enabled);
          });
          ipcRenderer.send('getMarketPricingEnabled');
        } catch(err) {
          console.error(err);
        }
      });
    }
    return this.pricingEnabledObservable;
  }

  /**
   * Returns pricing objects
   * @returns {Observable<Pricing[]>}
   */
  public getPricing(): Observable<Pricing> {
    const { ipcRenderer } = window.electron;
    if (!this.pricingObservable) {
      this.pricingObservable = Observable.create(observer => {
        try {
          ipcRenderer.on('pricingMultipliers', (e, items) => {
            const pricing = new Pricing(items);
            observer.next(pricing);
          });
          ipcRenderer.send('getPricing');
        } catch(err) {
          console.error(err);
        }
      });
    }
    return this.pricingObservable;
  }

}
