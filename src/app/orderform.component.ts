import { Component, Input } from '@angular/core';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'orderform',
  templateUrl: './orderform.component.html',
  // styleUrls: ['./open-orders.component.scss']
})
export class OrderformComponent {
  title = 'Order Form';

  @Input() public symbols:string[];

  constructor(private decimalPipe:DecimalPipe) { }

  formatNumber(num:string, symbol:string): string {
    const format = symbol !== "USD" ? "1.8-8" : "1.2-2";
    return this.decimalPipe.transform(num,format);
  }
}
