export class Order {
  sequence: number;
  bids: any[][];
  asks: any[][];

  public static fromObject(obj: any): Order {
    const inst = new Order();
    return Object.assign(inst, obj);
  }

}
