import 'rxjs/add/operator/map';
import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { DecimalPipe } from '@angular/common';

import { Order } from './order';
import { OrderbookService } from './orderbook.service';
import { TableComponent } from './table/table.component';

@Component({
  selector: 'orderbook',
  templateUrl: './orderbook.component.html',
  styleUrls: ['./order-book.component.scss']
})
export class OrderbookComponent {
  @ViewChild('orderbookTable') public orderbookTable: TableComponent;

  public title = 'Order Book';
  public rows: any[];

  @Input() public symbols:string[];

  constructor(private orderbookService: OrderbookService, private decimalPipe:DecimalPipe) { }

  getOrderbook(): void {
    this.orderbookService.getOrderbook(this.symbols)
      .subscribe(orderbook => {
        this.rows = [
          ...orderbook.asks,
          [null, null, null, null, 'divide'],
          ...orderbook.bids
        ];

        this.orderbookTable.scrollToMiddle();
      });
  }

  ngOnInit(): void {
    this.getOrderbook();
  }

  ngOnChanges(): void {
    this.getOrderbook();
  }

  onRowSelect(row) {
    this.orderbookService.requestOrder(row);
  }
}
