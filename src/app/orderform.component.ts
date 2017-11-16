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

  public selectedTab: string = 'buy';

  public title = 'Order Form';
  public totalPrice = 0;

  constructor(private decimalPipe: DecimalPipe) { }

  ngOnInit() {}

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
