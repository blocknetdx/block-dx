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
  public title = 'Open Orders';
  public openorders: Openorder[];

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
    this.appService.marketPairChanges.subscribe((symbols) => {
      this.symbols = symbols;
      if (symbols) {
        this.openorderService.getOpenorders(this.symbols)
          .then(openorders => {
            this.openorders = openorders;
          });
      }
    });
  }
}
