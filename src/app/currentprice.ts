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

  public _volume = 0;
  public _open = 0;
  public _close = 0;
  public _low = 0;
  public _high = 0;

  constructor() {}

  public get priceDiff(): number {
    const last = parseFloat(this.last);
    const open = parseFloat(this.open);
    const res = math
      .chain(last)
      .divide(open)
      .subtract(1)
      .done();
    return res || 0;
  }

  public get priceStatus(): string {
    return (this.priceDiff * 100) > 0 ? 'up' : 'down';
  }

  public static fromObject(obj: any): Currentprice {
    const inst = new Currentprice();
    inst._volume = obj.volume;
    inst._open = obj.open;
    inst._close = obj.close;
    inst._low = obj.low;
    inst._high = obj.high;
    return Object.assign(inst, obj);
  }
}
