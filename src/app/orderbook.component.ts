import 'rxjs/add/operator/map';
import { Component, OnInit, Input } from '@angular/core';
import { DecimalPipe } from '@angular/common';

// import { ORDERS } from './mock-orderbook';
import { Order } from './order';
import { OrderbookService } from './orderbook.service';

@Component({
  selector: 'orderbook',
  templateUrl: './orderbook.component.html',
  // styleUrls: ['./order-book.component.scss'],
  providers: [OrderbookService]
})
export class OrderbookComponent {
  public title = 'Order Book';
  public order: Order;

  @Input() public symbols:string[];

  constructor(private orderbookService: OrderbookService, private decimalPipe:DecimalPipe) { }

  getOrderbook(): void {
    this.orderbookService.getOrderbook(this.symbols)
      .subscribe(orderbook => this.order = orderbook)
  }

  formatNumber(num:string, symbol:string): string {
    const format = symbol !== "USD" ? "1.8-8" : "1.2-2";
    return this.decimalPipe.transform(num,format);
  }

  ngOnInit(): void {
    this.getOrderbook();
  }

  ngOnChanges(): void {
    this.getOrderbook();
  }

  ngAfterViewInit(): void {

  }
}
