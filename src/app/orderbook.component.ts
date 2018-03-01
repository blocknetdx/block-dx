import { Component, OnInit, Input, ViewChild, NgZone } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import 'rxjs/add/operator/map';

import { naturalSort } from './util';
import { Order } from './order';
import { OrderbookService } from './orderbook.service';
import { TableComponent } from './table/table.component';
import { AppService } from './app.service';
import {TradehistoryService} from './tradehistory.service';
import { Trade } from './trade';
import {CurrentpriceService} from './currentprice.service';

@Component({
  selector: 'app-orderbook',
  templateUrl: './orderbook.component.html',
  styleUrls: ['./order-book.component.scss']
})
export class OrderbookComponent implements OnInit {
  @ViewChild('orderbookTable') public orderbookTable: TableComponent;

  public sections: any[] = [];
  public symbols:string[] = [];
  public lastTradePrice = '';
  private showSpread = false;

  constructor(
    private appService: AppService,
    private decimalPipe:DecimalPipe,
    private orderbookService: OrderbookService,
    private tradehistoryService: TradehistoryService,
    private currentpriceService: CurrentpriceService,
    private zone: NgZone
  ) { }

  ngOnInit(): void {

    const { zone } = this;

    this.appService.marketPairChanges.subscribe((symbols) => {
      zone.run(() => {
        this.symbols = symbols;
      });
    });

    this.orderbookService.getOrderbook()
      // .first()
      .subscribe(orderbook => {
        zone.run(() => {
          const asks = orderbook.asks;
          const bids = orderbook.bids;

          this.showSpread = asks.length === 0 && bids.length === 0 ? false : true;

          this.sections = [
            {rows: asks},
            {rows: bids}
          ];
          this.orderbookTable.scrollToMiddle();
        });
      });

    this.currentpriceService.currentprice.subscribe((cp) => {
      zone.run(() => {
        this.lastTradePrice = cp.last;
      });
    });

  }

  onRowSelect(row) {
    if (row) {
      this.orderbookService.requestOrder(row);
    }
  }
}
