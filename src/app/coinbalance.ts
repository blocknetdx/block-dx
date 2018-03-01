export class CoinBalance {
  public coin: string;
  public amount: number;

  public static fromObject(obj: any): CoinBalance {
    const inst = new CoinBalance();
    return Object.assign(inst, obj);
  }
}
