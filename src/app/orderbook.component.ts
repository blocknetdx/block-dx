import { Component, OnInit } from '@angular/core';

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
  title = 'OrderBook';
  // orders = ORDERS;
  orderbook: Order[];

  constructor(private orderbookService: OrderbookService) { }

  getOrderbook(): void {
    this.orderbookService.getOrderbook().then(orderbook => this.orderbook = orderbook)
  }

  ngOnInit(): void {
    this.getOrderbook();
  }
}
