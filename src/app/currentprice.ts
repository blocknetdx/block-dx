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
  public priceDiff = 0;
  public priceStatus: string;

  public _volume = 0;
  public _open = 0;
  public _close = 0;
  public _low = 0;
  public _high = 0;

  constructor(props: any) {
    Object.assign(this, props);
    this.last = props.close.toString();
    this._volume = props.volume;
    this._open = props.open;
    this._close = props.close;
    this._low = props.low;
    this._high = props.high;
    this.priceDiff = math
      .chain(this._close)
      .divide(this._open)
      .subtract(1)
      .done();
    this.priceStatus = (this.priceDiff * 100) > 0 ? 'up' : 'down';
  }

  public static fromObject(obj: any): Currentprice {
    return new Currentprice(obj);
  }
}
