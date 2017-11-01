import { Component, OnInit, NgZone, Input } from '@angular/core';
import { DecimalPipe } from '@angular/common';

import { Currentprice } from './currentprice';
import { CurrentpriceService } from './currentprice.service';

@Component({
  selector: 'currentprice',
  templateUrl: './currentprice.component.html',
  // styleUrls: ['./currentprice.component.scss']
  providers: [CurrentpriceService]
})
  export class CurrentpriceComponent {
  title = 'Current Price';
  currentprice: Currentprice;

  @Input() public symbols:string[];

  constructor(private currentpriceService: CurrentpriceService, private decimalPipe: DecimalPipe) { }

  getCurrentprice(): void {
    this.currentpriceService.getCurrentprice(this.symbols).then(currentprice => {
      this.currentprice = currentprice[0];
    })
  }

  formatNumber(num:string, symbol:string): string {
    const format = symbol !== "USD" ? "1.5-5" : "1.2-2";
    return this.decimalPipe.transform(num,format);
  }

  ngOnInit(): void {
    this.getCurrentprice();
  }

  ngOnChanges(): void {
    this.getCurrentprice();
  }
}
