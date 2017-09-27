import { Injectable } from '@angular/core';

import { Trade } from './trade';
import { TRADES } from './mock-tradehistory';


@Injectable()
export class TradehistoryService {
  getTradehistory(): Promise<Trade[]> {
    return Promise.resolve(TRADES);
  }
}
