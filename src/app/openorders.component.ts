import { Component, Input, TemplateRef, ViewChild } from '@angular/core';
import 'rxjs/add/operator/map';

import { AppService } from './app.service';
import { Openorder } from './openorder';
import { OpenordersService } from './openorders.service';

@Component({
  selector: 'openorders',
  templateUrl: './openorders.component.html',
  styleUrls: ['./open-orders.component.scss'],
  providers: [OpenordersService]
})
export class OpenordersComponent {
  public openorders: Openorder[];
  public filledorders: Openorder[];
  public tabs: any[];

  private _symbols: string[];
  public get symbols(): string[] { return this._symbols; }
  public set symbols(val:string[]) {
    this._symbols = val;
  }

  constructor(
    private appService: AppService,
    private openorderService: OpenordersService
  ) { }

  ngOnInit() {
    this.tabs = [
      {title: 'Open Orders', active: true},
      {title: 'Filled Orders', active: false}
    ];

    this.appService.marketPairChanges.subscribe((symbols) => {
      this.symbols = symbols;
      if (symbols) {
        this.openorderService.getOpenorders(this.symbols)
          .then((openorders) => {
            this.openorders = openorders.map((o) => {
              o['row_class'] = o.side;
              return o;
            });
          });

        this.openorderService.getFilledorders(this.symbols)
          .then((filledorders) => {
            this.filledorders = filledorders.map((o) => {
              o['row_class'] = o.side;
              return o;
            });
          });
      }
    });
  }

  setActiveTab(tab) {
    this.tabs = this.tabs.map((t) => {
      t.active = t === tab;
      return t;
    });
  }
}
