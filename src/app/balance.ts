export class Balance {

  public coin: string;
  public amount: number;

  public static fromObject(obj: any): Balance {
    const inst = new Balance();
    return Object.assign(inst, obj);
  }

}
