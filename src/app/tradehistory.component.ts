import { Component, OnInit, Input } from '@angular/core';
import { DecimalPipe } from '@angular/common';

import { AppService } from './app.service';
import { Trade } from './trade';
import { TradehistoryService } from './tradehistory.service';

@Component({
  selector: 'tradehistory',
  templateUrl: './tradehistory.component.html',
  styleUrls: ['./tradehistory.component.scss'],
  providers: [TradehistoryService]
})
export class TradehistoryComponent {
  public tradehistory: Trade[];

  public symbols:string[];

  constructor(
    private appService: AppService,
    private tradeHistoryService: TradehistoryService
  ) {}

  ngOnInit() {
    this.appService.marketPairChanges.subscribe((symbols) => {
      this.symbols = symbols;
      if (symbols) {
        this.tradeHistoryService.getTradehistory(this.symbols)
          .subscribe(tradehistory => {
            this.tradehistory = tradehistory;
          });
      }
    });
  }
}
