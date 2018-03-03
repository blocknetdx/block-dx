import * as math from 'mathjs';

math.config({
  number: 'BigNumber',
  precision: 64
});

export class Currentprice {
  public open: string;
  public high: string;
  public low: string;
  public volume: string;
  public last: string;
  public volume_30day: string;
  public time: string;

  constructor() {}

  public get priceDiff(): number {
    const last = parseFloat(this.last);
    const open = parseFloat(this.open);
    // return (last / open) - 1;
    return math
      .chain(last)
      .divide(open)
      .subtract(1)
      .done();
  }

  public get priceStatus(): string {
    return (this.priceDiff * 100) > 0 ? 'up' : 'down';
  }

  public static fromObject(obj: any): Currentprice {
    const inst = new Currentprice();
    return Object.assign(inst, obj);
  }
}
