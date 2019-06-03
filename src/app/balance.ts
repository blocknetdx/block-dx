export class Balance {

  public coin: string;
  public amount: string;
  public format: string;

  constructor(props: any) {
    Object.assign(this, props);
    this.format = this.coin !== 'USD' ? '1.8-8' : '1.2-2';
  }

  public static fromObject(obj: any): Balance {
    return new Balance(obj);
  }

}
