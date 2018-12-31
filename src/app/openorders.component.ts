import { Component, Input, TemplateRef, ViewChild, OnInit, NgZone } from '@angular/core';

import { BaseComponent } from './base.component';
import { AppService } from './app.service';
import { Openorder } from './openorder';
import { OpenordersService } from './openorders.service';
import { BreakpointService } from './breakpoint.service';
import * as math from 'mathjs';
import { PricingService } from './pricing.service';
import { Pricing } from './pricing';

math.config({
  number: 'BigNumber',
  precision: 64
});

@Component({
  selector: 'app-openorders',
  templateUrl: './openorders.component.html',
  styleUrls: ['./open-orders.component.scss']
})
export class OpenordersComponent extends BaseComponent implements OnInit {
  public openorders: Openorder[];
  public selectable: boolean;
  public pricing: Pricing;
  public pricingEnabled = false;
  public pricingAvailable = false;
  public longestTokenLength: number;

  private _symbols: string[] = [];
  public get symbols(): string[] { return this._symbols; }
  public set symbols(val:string[]) {
    this._symbols = val;
  }

  constructor(
    private appService: AppService,
    private openorderService: OpenordersService,
    private breakpointService: BreakpointService,
    private pricingService: PricingService,
    private zone: NgZone
  ) { super(); }

  ngOnInit() {

    this.appService.marketPairChanges
      .takeUntil(this.$destroy)
      .subscribe((symbols) => {
        this.zone.run(() => {
          if(symbols) {
            this.symbols = symbols;
          }
        });
      });

    this.openorderService.getOpenorders()
      .takeUntil(this.$destroy)
      .subscribe(openorders => {
        this.zone.run(() => {
          const orders = openorders
            .filter(o => o.status !== 'finished' && o.status !== 'canceled')
            .map((o) => {
              o['row_class'] = o.side;
              return o;
            });
          this.openorders = orders;
          const tokens = openorders
            .reduce((arr, o) => {
              return [...arr, o.maker, o.taker];
            }, [])
            .sort((a, b) => a.length === b.length ? 0 : a.length > b.length ? -1 : 1);
          this.longestTokenLength = tokens.length > 0 ? tokens[0].length : 0;
        });
      });

    this.breakpointService.breakpointChanges.first()
      .takeUntil(this.$destroy)
      .subscribe((bp) => {
        this.zone.run(() => {
          this.selectable = ['xs', 'sm'].includes(bp);
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

  cancelOrder(order) {
    const { electron } = window;
    order.canceled = true;
    order['row_class'] = 'canceled';
    electron.ipcRenderer
      .send('cancelOrder', order.id);
  }

  prepareNumber(num) {
    return math.round(num, 6);
  }

  cancelable(state) {
    return state !== 'finished' && state !== 'canceled';
  }

  padToken(token) {
    const diff = this.longestTokenLength - token.length;
    for(let i = 0; i < diff; i++) {
      token += ' ';
    }
    return token;
  }

  getStatusDotColor(status) {
    if(['new'].includes(status)) {
      return '#888';
    } else if(['accepting', 'hold', 'initialized', 'created', 'commited'].includes(status)) {
      return '#ff0';
    } else if(['finished'].includes(status)) {
      return '#0f0';
    } else if(['expired', 'offline', 'invalid', 'rolled back'].includes(status)) {
      return '#c00';
    } else if(['rollback failed'].includes(status)) {
      return '#ea00ff';
    } else if(['canceled'].includes(status)) {
      return '#000';
    } else { // open
      return '#fff';
    }
  }

}
