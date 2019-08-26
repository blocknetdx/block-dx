import * as math from 'mathjs';
import * as _ from 'lodash';
import { PricingItem } from './pricing-item';

math.config({
  number: 'BigNumber',
  precision: 64
});

const { bignumber } = math;

export class Pricing {

  public enabled: boolean;
  public in: string;

  private readonly hash: Map<string, PricingItem>;

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
    this.enabled = preppedItems.length > 0;
    this.in = preppedItems.length > 0 ? preppedItems[0].base: '';

    // Build hash lookup
    this.hash = new Map();
    preppedItems.forEach(item => { this.hash.set(item.coin, item); });
  }

  public canGetPrice(token: string): boolean {
    if (!this.hash.has(token))
      return false;
    const item = this.hash.get(token);
    return !_.isNil(item.multiplier);
  }

  public getPrice(amount: number, token: string): number {
    if (!this.hash.has(token))
      return 0;
    const item = this.hash.get(token);
    if (_.isNil(item.multiplier))
      return 0;
    return math.multiply(bignumber(amount), bignumber(item.multiplier)).toNumber();
  }

  public getFromBasePrice(amount: number, token: string): number {
    if (!this.hash.has(token))
      return 0;
    const item = this.hash.get(token);
    if (_.isNil(item.multiplier))
      return 0;
    return math.divide(bignumber(amount), bignumber(item.multiplier)).toNumber();
  }

}
