export class Cryptocurrency {
  public symbol: string;
  public name: string;
  public last: number;
  public volume: number;
  public change: number;
  public local: boolean;

  public static fromObject(obj: any): Cryptocurrency {
    const { ipcRenderer } = window.electron;
    const inst = new Cryptocurrency();
    Object.assign(inst, obj, {
      name: ipcRenderer.sendSync('getTokenName', obj.symbol)
    });
    return inst;
  }

  public toString(): string {
    return `${this.name['capitalize']()} (${this.symbol.toUpperCase()})`;
  }

}
