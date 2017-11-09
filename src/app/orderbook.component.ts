import 'rxjs/add/operator/map';
import { Component, OnInit, Input } from '@angular/core';
import { DecimalPipe } from '@angular/common';

import { Order } from './order';
import { OrderbookService } from './orderbook.service';

@Component({
  selector: 'orderbook',
  templateUrl: './orderbook.component.html',
  styleUrls: ['./order-book.component.scss'],
  providers: [OrderbookService]
})
export class OrderbookComponent {
  public title = 'Order Book';
  public rows: any[];

  @Input() public symbols:string[];

  constructor(private orderbookService: OrderbookService, private decimalPipe:DecimalPipe) { }

  getOrderbook(): void {
    this.orderbookService.getOrderbook(this.symbols)
      .subscribe(orderbook => {
        this.rows = [...orderbook.asks, ...orderbook.bids];
      });
  }

  ngOnInit(): void {
    this.getOrderbook();
  }

  ngOnChanges(): void {
    this.getOrderbook();
  }
}
