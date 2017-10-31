export class Currentprice {
  open: string;
  high: string;
  low: string;
  volume: string;
  last: string;
  volume_30day: string;

  constructor() {}

  public get priceDiff(): number {
    const last = parseFloat(this.last);
    const open = parseFloat(this.open);
    return (last/open) - 1;
  }

  public get priceStatus(): string {
    return (this.priceDiff * 100) > 0 ? 'up' : 'down';
  }

  public static fromObject(obj: any): Currentprice {
    const inst = new Currentprice();
    return Object.assign(inst, obj);
  }
};
