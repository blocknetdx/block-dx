export class Currentprice {
  public open: string;
  public high: string;
  public low: string;
  public volume: string;
  public last: string;
  public volume_30day: string;

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
