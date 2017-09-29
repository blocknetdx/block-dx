import { Component } from '@angular/core';

import { ORDERS } from './mock-orderbook';

@Component({
  selector: 'orderbook',
  templateUrl: './orderbook.component.html',
  // styleUrls: ['./order-book.component.scss']
})
export class OrderbookComponent {
  title = 'OrderBook';
  orders = ORDERS;
}
