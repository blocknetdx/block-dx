import 'rxjs/add/operator/map';
import { Component, Input } from '@angular/core';
import { DecimalPipe } from '@angular/common';

// import { ORDERS } from './mock-orderbook';
import { Openorder } from './openorder';
import { OpenordersService } from './openorders.service';

@Component({
  selector: 'openorders',
  templateUrl: './openorders.component.html',
  // styleUrls: ['./open-orders.component.scss']
  providers: [OpenordersService]
})
export class OpenordersComponent {
  title = 'Open Orders';

  openorders: Openorder[];

  @Input() public symbols:string[];

  constructor(private openorderService: OpenordersService, private decimalPipe:DecimalPipe) { }

  getOpenorders(): void {
    this.openorderService.getOpenorders(this.symbols).then(openorders => this.openorders = openorders)
  }

  formatNumber(num:string, symbol:string): string {
    const format = symbol !== "USD" ? "1.5-5" : "1.2-2";
    return this.decimalPipe.transform(num,format);
  }

  ngOnInit(): void {
    this.getOpenorders();
  }

  ngOnChanges(): void {
    this.getOpenorders();
  }


}
