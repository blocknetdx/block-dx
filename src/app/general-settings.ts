export class GeneralSettings {

  showWallet = false;
  showAllOrders = false;

  static fromObject(data: any): GeneralSettings {
    const instance = new GeneralSettings();
    return Object.assign(instance, data);
  }

}
