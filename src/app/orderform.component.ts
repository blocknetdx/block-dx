import { Component, Input } from '@angular/core';
import { DecimalPipe } from '@angular/common';

import { Currentprice } from './currentprice';
import { CurrentpriceService } from './currentprice.service';

@Component({
  selector: 'orderform',
  templateUrl: './orderform.component.html',
  styleUrls: ['./orderform.component.scss']
})
export class OrderformComponent {
  @Input() public symbols:string[];
  @Input() public currentPrice: Currentprice;

  public title = 'Order Form';
  public totalPrice = 0;

  public selectedTab: string = 'buy';
  public buyOrderTypes: any[];
  public sellOrderTypes: any[];

  public selectedBuyType: any;
  public selectedSellType: any;

  constructor(private decimalPipe: DecimalPipe) { }

  ngOnInit() {
    this.buyOrderTypes = [
      { value: 'market', viewValue: 'Market Order'},
      { value: 'limit', viewValue: 'Limit Order'},
      { value: 'stop', viewValue: 'Stop Order'}
    ];

    this.sellOrderTypes = [
      { value: 'market', viewValue: 'Market Order'},
      { value: 'limit', viewValue: 'Limit Order'},
      { value: 'stop', viewValue: 'Stop Order'}
    ];
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
