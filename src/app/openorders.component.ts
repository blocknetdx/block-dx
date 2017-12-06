import { Component, Input, TemplateRef, ViewChild } from '@angular/core';

import { BaseComponent } from './base.component';
import { AppService } from './app.service';
import { Openorder } from './openorder';
import { OpenordersService } from './openorders.service';

@Component({
  selector: 'openorders',
  templateUrl: './openorders.component.html',
  styleUrls: ['./open-orders.component.scss']
})
export class OpenordersComponent extends BaseComponent {
  public openorders: Openorder[];

  private _symbols: string[];
  public get symbols(): string[] { return this._symbols; }
  public set symbols(val:string[]) {
    this._symbols = val;
  }

  constructor(
    private appService: AppService,
    private openorderService: OpenordersService
  ) { super(); }

  ngOnInit() {
    this.appService.marketPairChanges
      .takeUntil(this.$destroy)
      .subscribe((symbols) => {
        this.symbols = symbols;
        if (symbols) {
          this.openorderService.getOpenorders(this.symbols)
            .then((openorders) => {
              this.openorders = openorders.map((o) => {
                o['row_class'] = o.side;
                return o;
              });
            });
        }
    });
  }

  cancelOrder(order) {
    order.canceled = true;
    order['row_class'] = 'canceled';
    // this.openorders = this.openorders.filter((r) => {
    //   return r !== row;
    // });
  }
}
