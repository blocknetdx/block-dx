import { Component, OnInit, NgZone } from '@angular/core';
import * as math from 'mathjs';

import { BaseComponent } from '../base.component';
import { AppService } from '../app.service';
import { Openorder } from '../openorder';
import { OpenordersService } from '../openorders.service';
import { PricingService } from '../pricing.service';
import { Pricing } from '../pricing';
import * as OrderStates from '../../orderstates';
import {Localize} from '../localize/localize.component';

math.config({
  number: 'BigNumber',
  precision: 64
});

const { bignumber } = math;

@Component({
  selector: 'bn-filled-orders',
  templateUrl: './filled-orders.component.html',
  styleUrls: ['./filled-orders.component.scss']
})
export class FilledOrdersComponent extends BaseComponent implements OnInit {
  OrderStates: typeof OrderStates = OrderStates;

  public symbols: string[] = [];
  public filledorders: Openorder[];
  public pricing: Pricing;
  public pricingEnabled = true;
  public pricingAvailable = true;
  public longestTokenLength: number;

  private _hashPadToken = {};
  public get hashPadToken(): object { return this._hashPadToken; }

  public Localize = Localize;

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
        this.zone.run(() => {
          if (symbols)
            this.symbols = symbols;
          this.updatePricingAvailable(this.pricing ? this.pricing.enabled : false);
        });
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
          // Calc padding
          this.filledorders.forEach(order => {
            this._hashPadToken[order.maker] = this.padToken(order.maker);
            this._hashPadToken[order.taker] = this.padToken(order.taker);
          });
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

  updatePricingAvailable(enabled: boolean) {
    this.pricingAvailable = enabled;
    if (this.filledorders && this.filledorders.length > 0 && this.pricing)
      this.filledorders.forEach(order => {
        order.updatePricingAvailable(enabled, this.pricing);
      });
  }

  padToken(token) {
    const diff = this.longestTokenLength - token.length;
    for(let i = 0; i < diff; i++) {
      token += ' ';
    }
    return token;
  }

  calculatePairPrice(total, size) {
    return math.divide(bignumber(total), bignumber(size)).toFixed(6);
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

  onRowContextMenu({ row, clientX, clientY }) {

    const { Localize } = this;

    const order = row;

    const { Menu } = window.electron.remote;
    const { clipboard, ipcRenderer } = window.electron;

    const menuTemplate = [];

    const { symbols } = this;
    const { maker, taker } = order;

    if(!symbols.includes(maker) || !symbols.includes(taker)) {
      menuTemplate.push({
        label: Localize.text('View Market', 'filledOrders'),
        click: () => {
          ipcRenderer.send('setKeyPair', [maker, taker]);
        }
      });
    }

    menuTemplate.push({
      label: Localize.text('View Details', 'filledOrders'),
      click: () => {
        ipcRenderer.send('openMyOrderDetailsWindow', order.id);
      }
    });

    const menu = Menu.buildFromTemplate(menuTemplate);
    menu.popup({x: clientX, y: clientY});
  }

}
