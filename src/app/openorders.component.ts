import { Component, Input, TemplateRef, ViewChild } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import 'rxjs/add/operator/map';

import { Openorder } from './openorder';
import { OpenordersService } from './openorders.service';
import { BlockCurrencyPipe } from './block-currency.pipe';

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
  @Input() public set symbols(val:string[]) {
    this._symbols = val;
  }

  constructor(
    private openorderService: OpenordersService,
    private blockCurrency: BlockCurrencyPipe,
    private decimalPipe: DecimalPipe
  ) { }

  getOpenorders(): void {
    this.openorderService.getOpenorders(this.symbols)
      .then(openorders => {
        this.openorders = openorders;
      });
  }

  ngOnInit(): void {
    this.getOpenorders();
  }

  ngOnChanges(): void {
    this.getOpenorders();
  }
}
