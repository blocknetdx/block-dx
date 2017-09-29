import { Component, OnInit } from '@angular/core';

import { Trade } from './trade';
import { TradehistoryService } from './tradehistory.service';

@Component({
  selector: 'tradehistory',
  templateUrl: './tradehistory.component.html',
  // styleUrls: ['./tradehistory.component.scss'],
  providers: [TradehistoryService]
})
export class TradehistoryComponent {
  title = 'Trade History';
  tradehistory: Trade[];

  constructor(private tradeHistoryService: TradehistoryService) { }

  getTradehistory(): void {
    this.tradeHistoryService.getTradehistory().then(tradehistory => this.tradehistory = tradehistory)
  }

  ngOnInit(): void {
    this.getTradehistory();
  }
}
