import { Component, OnInit, Input, ViewChild, NgZone } from '@angular/core';
import 'rxjs/add/operator/map';
import * as math from 'mathjs';

import { naturalSort } from './util';
import { Order } from './order';
import { OrderbookService } from './orderbook.service';
import { TableComponent } from './table/table.component';
import { AppService } from './app.service';
import {NumberFormatPipe} from './pipes/decimal.pipe';
// import {TradehistoryService} from './tradehistory.service';
// import { Trade } from './trade';
// import {CurrentpriceService} from './currentprice.service';

math.config({
  number: 'BigNumber',
  precision: 64
});

@Component({
  selector: 'app-orderbook',
  templateUrl: './orderbook.component.html',
  styleUrls: ['./order-book.component.scss']
})
export class OrderbookComponent implements OnInit {
  @ViewChild('orderbookTable') public orderbookTable: TableComponent;

  public sections: any[] = [];
  public symbols:string[] = [];
  // public lastTradePrice = '';
  public spread = '';
  private showSpread = false;

  constructor(
    private appService: AppService,
    private numberFormatPipe: NumberFormatPipe,
    private orderbookService: OrderbookService,
    // private tradehistoryService: TradehistoryService,
    // private currentpriceService: CurrentpriceService,
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

          let spread;
          if(asks.length > 0 && bids.length > 0) {
            const bestAsk = Number(asks[asks.length - 1][0]);
            const bestBid = Number(bids[0][0]);
            spread = String(math.subtract(bestAsk, bestBid));
          } else {
            spread = '';
          }
          this.spread = spread;

          this.orderbookTable.scrollToMiddle();
        });
      });

    // this.currentpriceService.currentprice.subscribe((cp) => {
    //   zone.run(() => {
    //     this.lastTradePrice = cp.last;
    //   });
    // });

  }

  onRowSelect(row) {
    if (row) {
      this.orderbookService.requestOrder(row);
    }
  }
}
