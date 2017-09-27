import { Injectable } from '@angular/core';

import { Trade } from './trade';
import { TRADES } from './mock-tradehistory';


@Injectable()
export class TradehistoryService {
  getTradehistory(): Promise<Trade[]> {
    return Promise.resolve(TRADES);
  }

  getTradehistorySlowly(): Promise<Trade[]> {
    return new Promise(resolve => {
      // Simulate server latency with 2 second delay
      setTimeout(() => resolve(this.getTradehistory()), 2000);
    });
  }
}
