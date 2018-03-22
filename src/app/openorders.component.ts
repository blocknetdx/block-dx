import { Component, Input, TemplateRef, ViewChild, OnInit, NgZone } from '@angular/core';

import { BaseComponent } from './base.component';
import { AppService } from './app.service';
import { Openorder } from './openorder';
import { OpenordersService } from './openorders.service';
import { BreakpointService } from './breakpoint.service';
import * as math from 'mathjs';

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

  private _symbols: string[] = [];
  public get symbols(): string[] { return this._symbols; }
  public set symbols(val:string[]) {
    this._symbols = val;
  }

  constructor(
    private appService: AppService,
    private openorderService: OpenordersService,
    private breakpointService: BreakpointService,
    private zone: NgZone
  ) { super(); }

  ngOnInit() {

    this.appService.marketPairChanges
      // .takeUntil(this.$destroy)
      .subscribe((symbols) => {
        this.zone.run(() => {
          if(symbols) {
            this.symbols = symbols;
          }
        });
    });

    this.openorderService.getOpenorders()
      .subscribe(openorders => {
        this.zone.run(() => {
          this.openorders = openorders
            .filter(o => o.status !== 'finished' && o.status !== 'canceled')
            .map((o) => {
              o['row_class'] = o.side;
              return o;
            });
        });
      });

    this.breakpointService.breakpointChanges.first()
      .subscribe((bp) => {
        this.zone.run(() => {
          this.selectable = ['xs', 'sm'].includes(bp);
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
    return state !== 'finished' && state !== 'canceled' && state !== 'created';
  }
}
