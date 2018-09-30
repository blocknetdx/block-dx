export class PricingItem {
  public coin: string;
  public base: string;
  public multiplier: number;

  public static fromObject(obj: any): PricingItem {
    const inst = new PricingItem();
    Object.assign(inst, obj);
    return inst;
  }

}
