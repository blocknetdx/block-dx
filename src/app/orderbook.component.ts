import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import 'rxjs/add/operator/map';

import { naturalSort } from './util';
import { Order } from './order';
import { OrderbookService } from './orderbook.service';
import { TableComponent } from './table/table.component';
import { AppService } from './app.service';
import { AppDataService } from './appdata.service';

@Component({
  selector: 'orderbook',
  templateUrl: './orderbook.component.html',
  styleUrls: ['./order-book.component.scss']
})
export class OrderbookComponent {
  @ViewChild('orderbookTable') public orderbookTable: TableComponent;

  public sections: any[] = [];
  public symbols:string[] = [];

  constructor(
    private appService: AppService,
    private appDataService: AppDataService,
    private decimalPipe:DecimalPipe
  ) { }

  ngOnInit(): void {
    this.appService.marketPairChanges.subscribe((symbols) => {
      this.symbols = symbols;
      if (symbols) {
        this.appDataService.getOrderbook(this.symbols)
          .subscribe(orderbook => {
            const asks = orderbook.asks.sort((a,b) => {
              if (a[0] < b[0]) return 1;
              if (a[0] > b[0]) return -1;
              return 0;
            });
            const bids = orderbook.bids.sort((a,b) => {
              if (a[0] < b[0]) return -1;
              if (a[0] > b[0]) return 1;
              return 0;
            });

            this.sections = [
              {rows: asks},
              {rows: bids}
            ];

            this.orderbookTable.scrollToMiddle();
          });
      }
    });
  }

  onRowSelect(row) {
    if (row) {
      this.orderbookService.requestOrder(row);
    }
  }
}
