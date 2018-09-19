import * as math from 'mathjs';
import { PricingItem } from './pricing-item';

math.config({
  number: 'BigNumber',
  precision: 64
});

export class Pricing {

  private items: PricingItem[] = [];

  public enabled: boolean;
  public in: string;

  constructor(items: PricingItem[]) {
    const preppedItems = items
      .map(item => {
        const pricing = PricingItem.fromObject({
          coin: item.coin,
          base: item.base,
          multiplier: item.multiplier
        });
        return pricing;
      });
    this.items = preppedItems;
    this.enabled = preppedItems.length > 0 ? true : false;
    this.in = preppedItems.length > 0 ? preppedItems[0].base: '';
  }

  public getPrice(amount: number, token: string): any {
    const item = this.items.find(i => i.coin === token);
    if(item) {
      return math.multiply(amount, item.multiplier);
    } else {
      return 0;
    }
  }

  public getFromBasePrice(amount: number, token: string): any {
    const item = this.items.find(i => i.coin === token);
    if(item) {
      return math.divide(amount, item.multiplier);
    } else {
      return 0;
    }
  }

}
