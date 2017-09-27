import { Injectable } from '@angular/core';

import { Trade } from './trade';
import { TRADES } from './mock-trade-history';


@Injectable()
export class TradeHistoryService {
  getTradeHistory(): Trade[] {
    return TRADES;
  }
}
