export class Trade {
  public time: string;
  public trade_id: number;
  public price: string;
  public size: string;
  public side: string;

  public get priceClasses(): string {
    const color = this.side === 'buy' ? 'color-red' : 'color-green';
    return [this.side, color].join(' ');
  }

  public get percentbarClasses(): string {
    const color = this.side === 'buy' ? 'bg-red' : 'bg-green';
    return [this.side, color].join(' ');
  }

  public static fromObject(obj: any): Trade {
    const inst = new Trade();
    return Object.assign(inst, obj);
  }
}
