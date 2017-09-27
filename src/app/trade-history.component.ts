import { Component, OnInit } from '@angular/core';

import { Trade } from './trade';
import { TradeHistoryService } from './trade-history.service';


@Component({
  selector: 'trade-history',
  templateUrl: './trade-history.component.html',
  // styleUrls: ['./trade-history.component.scss'],
  providers: [TradeHistoryService]
})
export class TradeHistoryComponent {
  title = 'Trade History';
  trades: Trade[];

  constructor(private tradeHistoryService: TradeHistoryService) { }

  getTradeHistory(): void {
    this.trades = this.tradeHistoryService.getTradeHistory();
  }

  ngOnInit(): void {
    this.getTradeHistory();
  }
}
