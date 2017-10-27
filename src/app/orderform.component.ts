import { Component, Input } from '@angular/core';
import { DecimalPipe } from '@angular/common';

import { Currentprice } from './currentprice';
import { CurrentpriceService } from './currentprice.service';

@Component({
  selector: 'orderform',
  templateUrl: './orderform.component.html',
  providers: [CurrentpriceService]
  // styleUrls: ['./open-orders.component.scss']
})
export class OrderformComponent {
  title = 'Order Form';
  currentprice: Currentprice;


  @Input() public symbols:string[];

  constructor(private currentpriceService: CurrentpriceService,private decimalPipe:DecimalPipe) { }

  formatNumber(num:string, symbol:string): string {
    const format = symbol !== "USD" ? "1.8-8" : "1.2-2";
    return this.decimalPipe.transform(num,format);
  }


  ngOnInit() {
    this.getCurrentprice();
  }

  ngOnChanges() {
    this.getCurrentprice();
  }

  getCurrentprice(): void {
    this.currentpriceService.getCurrentprice(this.symbols).then(currentprice => {
      this.currentprice = currentprice[0];
    })
  }

  totalPrice = 0;

  calcPrice(event: any) { // without type info
    var enteredValue = event.target.value;
    var currPrice = parseFloat(this.currentprice.last);
    this.totalPrice = enteredValue * currPrice;
  }
}
