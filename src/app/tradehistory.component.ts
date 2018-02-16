import { Component, OnInit, Input } from '@angular/core';
import { DecimalPipe } from '@angular/common';

import { AppService } from './app.service';
import { Trade } from './trade';
import { AppDataService } from './appdata.service';

@Component({
  selector: 'tradehistory',
  templateUrl: './tradehistory.component.html',
  styleUrls: ['./tradehistory.component.scss'],
  providers: [AppDataService]
})
export class TradehistoryComponent {
  public tradehistory: Trade[];

  public symbols:string[];

  constructor(
    private appService: AppService,
    private appDataService: AppDataService
  ) {}

  ngOnInit() {
    this.appService.marketPairChanges.subscribe((symbols) => {
      this.symbols = symbols;
      if (symbols) {
        this.appDataService.getTradehistory(this.symbols)
          .subscribe(tradehistory => {
            this.tradehistory = tradehistory;
          });
      }
    });
  }
}
