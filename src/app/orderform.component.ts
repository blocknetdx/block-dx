import { Component, Input, ViewChild } from '@angular/core';
import { DecimalPipe } from '@angular/common';

import { AppService } from './app.service';
import { Currentprice } from './currentprice';
import { CurrentpriceService } from './currentprice.service';
import { OrderbookService } from './orderbook.service';
import { SelectComponent } from './select/select.component';

@Component({
  selector: 'orderform',
  templateUrl: './orderform.component.html',
  styleUrls: ['./orderform.component.scss']
})
export class OrderformComponent {
  @ViewChild('typeSelect') public typeSelect: SelectComponent;

  public symbols:string[];
  public currentPrice: Currentprice;
  public title = 'Order Form';
  public totalPrice = 0;
  public selectedTab: string = 'buy';
  public buyOrderTypes: any[];
  public sellOrderTypes: any[];
  public selectedBuyType: any;
  public selectedSellType: any;
  public model: any;

  constructor(
    private decimalPipe: DecimalPipe,
    private appService: AppService,
    private currentpriceService: CurrentpriceService,
    private orderbookService: OrderbookService
  ) { }

  ngOnInit() {
    this.model = {};

    this.appService.marketPairChanges.subscribe((symbols) => {
      this.symbols = symbols;
    });
    this.currentpriceService.currentprice.subscribe((cp) => {
      this.currentPrice = cp;
    });

    this.orderbookService.requestedOrder
      .subscribe((order) => {
        this.selectedTab = order[4] === 'ask' ? 'buy' : 'sell';
        this.typeSelect.selected = this.buyOrderTypes[0];
        this.model.amount = order[1];
      });

    this.buyOrderTypes = [
      { value: 'market', viewValue: 'Market Order'},
      { value: 'limit', viewValue: 'Limit Order'}
      // { value: 'stop', viewValue: 'Stop Order'}
    ];

    this.sellOrderTypes = [
      { value: 'market', viewValue: 'Market Order'},
      { value: 'limit', viewValue: 'Limit Order'}
      // { value: 'stop', viewValue: 'Stop Order'}
    ];
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.typeSelect.selected = this.buyOrderTypes[0];
    });
  }

  formatNumber(num:string, symbol:string): string {
    const format = symbol !== "USD" ? "1.8-8" : "1.2-2";
    return this.decimalPipe.transform(num,format);
  }

  calcPrice(event: any) { // without type info
    var enteredValue = event.target.value;
    var currPrice = parseFloat(this.currentPrice.last);
    this.totalPrice = enteredValue * currPrice;
  }

  onOrderSubmit() {

  }
}
