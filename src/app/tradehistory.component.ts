import { Component, OnInit, Input } from '@angular/core';
import { DecimalPipe } from '@angular/common';

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

  @Input() public symbols:string[];

  constructor(private tradeHistoryService: TradehistoryService, private decimalPipe:DecimalPipe) { }

  getTradehistory(): void {
    this.tradeHistoryService.getTradehistory(this.symbols).then(tradehistory => {
      this.tradehistory = tradehistory
    })
  }

  formatNumber(num:string, symbol:string): string {
    const format = symbol !== "USD" ? "1.8-8" : "1.2-2";
    return this.decimalPipe.transform(num,format);
  }

  ngOnInit(): void {
    this.getTradehistory();
  }

  ngOnChanges(): void {
    this.getTradehistory();
  }
}
