export class Cryptocurrency {
  public symbol: string;
  public name: string;
  public last: number;
  public volume: number;
  public change: number;

  public static fromObject(obj: any): Cryptocurrency {
    let inst = new Cryptocurrency();
    Object.assign(inst, obj);
    return inst;
  }
}
