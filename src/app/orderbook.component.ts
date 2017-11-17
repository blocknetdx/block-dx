import 'rxjs/add/operator/map';
import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { DecimalPipe } from '@angular/common';

import { Order } from './order';
import { OrderbookService } from './orderbook.service';
import { TableComponent } from './table/table.component';
import { AppService } from './app.service';

@Component({
  selector: 'orderbook',
  templateUrl: './orderbook.component.html',
  styleUrls: ['./order-book.component.scss']
})
export class OrderbookComponent {
  @ViewChild('orderbookTable') public orderbookTable: TableComponent;

  public title = 'Order Book';
  public rows: any[];

  public symbols:string[];

  constructor(
    private appService: AppService,
    private orderbookService: OrderbookService,
    private decimalPipe:DecimalPipe
  ) { }

  ngOnInit(): void {
    this.appService.marketPairChanges.subscribe((symbols) => {
      this.symbols = symbols;
      if (symbols) {
        this.orderbookService.getOrderbook(this.symbols)
          .first()
          .subscribe(orderbook => {
            this.rows = [
              ...orderbook.asks,
              [null, null, null, null, 'divide'],
              ...orderbook.bids
            ];

            setTimeout(() => {
              this.orderbookTable.scrollToMiddle();
            });
          });
      }
    });
  }

  onRowSelect(row) {
    this.orderbookService.requestOrder(row);
  }
}
