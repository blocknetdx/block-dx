import { Component, OnInit, Input, NgZone } from '@angular/core';
import { DecimalPipe } from '@angular/common';

import { AppService } from './app.service';
import { Trade } from './trade';
import { TradehistoryService } from './tradehistory.service';

@Component({
  selector: 'app-tradehistory',
  templateUrl: './tradehistory.component.html',
  styleUrls: ['./tradehistory.component.scss']
  // providers: [TradehistoryService]
})
export class TradehistoryComponent implements OnInit {
  public tradehistory: Trade[];

  public symbols:string[] = [];

  constructor(
    private appService: AppService,
    private tradehistoryService: TradehistoryService,
    private zone: NgZone
  ) {}

  ngOnInit() {
    const { zone } = this;
    this.appService.marketPairChanges.subscribe((symbols) => {
      zone.run(() => {
        this.symbols = symbols;
      });
    });
    this.tradehistoryService.getTradehistory()
      .subscribe(tradehistory => {
        zone.run(() => {
          this.tradehistory = tradehistory;
        });
      });
  }
}
