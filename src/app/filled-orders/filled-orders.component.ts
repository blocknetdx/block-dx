import { Component, OnInit, NgZone } from '@angular/core';
import * as math from 'mathjs';

import { BaseComponent } from '../base.component';
import { AppService } from '../app.service';
import { Openorder } from '../openorder';
import { OpenordersService } from '../openorders.service';
import { PricingService } from '../pricing.service';
import { Pricing } from '../pricing';
import * as OrderStates from '../../orderstates';

math.config({
  number: 'BigNumber',
  precision: 64
});

@Component({
  selector: 'bn-filled-orders',
  templateUrl: './filled-orders.component.html',
  styleUrls: ['./filled-orders.component.scss']
})
export class FilledOrdersComponent extends BaseComponent implements OnInit {
  public symbols: string[] = [];
  public filledorders: Openorder[];
  public pricing: Pricing;
  public pricingEnabled = false;
  public pricingAvailable = false;
  public longestTokenLength: number;

  constructor(
    private appService: AppService,
    private openorderService: OpenordersService,
    private pricingService: PricingService,
    private zone: NgZone
  ) { super(); }

  ngOnInit() {
    this.appService.marketPairChanges
      .takeUntil(this.$destroy)
      .subscribe((symbols) => {
        this.symbols = symbols;
    });
    // this.openorderService.getOpenorders()
    //   .then((filledorders) => {
    //     this.filledorders = filledorders
    //       .filter(o => o.settled)
    //       .map((o) => {
    //         o['row_class'] = o.side;
    //         return o;
    //       });
    //   });
    this.openorderService.getOpenorders()
      .takeUntil(this.$destroy)
      .subscribe(openorders => {
        this.zone.run(() => {
          this.filledorders = openorders
            .filter(o => o.status === OrderStates.Finished || 
                        o.status === OrderStates.Canceled || 
                        o.status === OrderStates.Expired || 
                        o.status === OrderStates.Offline || 
                        o.status === OrderStates.Invalid || 
                        o.status === OrderStates.RolledBack)
            .map((o) => {
              o['row_class'] = o.side;
              return o;
            });
          const tokens = openorders
            .reduce((arr, o) => {
              return [...arr, o.maker, o.taker];
            }, [])
            .sort((a, b) => a.length === b.length ? 0 : a.length > b.length ? -1 : 1);
          this.longestTokenLength = tokens.length > 0 ? tokens[0].length : 0;
          // console.log('filledorders', this.filledorders);
        });
      });

    this.pricingService.getPricing()
      .takeUntil(this.$destroy)
      .subscribe(pricing => {
        this.zone.run(() => {
          this.pricing = pricing;
          this.pricingAvailable = pricing.enabled;
        });
    });
    this.pricingService.getPricingEnabled()
      .takeUntil(this.$destroy)
      .subscribe(enabled => {
        this.zone.run(() => {
          this.pricingEnabled = enabled;
        });
    });

  }

  padToken(token) {
    const diff = this.longestTokenLength - token.length;
    for(let i = 0; i < diff; i++) {
      token += ' ';
    }
    return token;
  }

  getStatusDotColor(status) {
    if([OrderStates.Finished].includes(status)) {
      return '#0f0';
    } else if([OrderStates.Canceled].includes(status)) {
      return '#000';
    } else {
      return '#fff';
    }
  }

}
