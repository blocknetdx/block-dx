import * as OrderStates from '../orderstates';
import { Pricing } from './pricing';

import * as moment from 'moment';
import * as math from 'mathjs';
import {Localize} from './localize/localize.component';

export class Openorder {
  id: string;
  price: number;
  size: string;
  total: string;
  product_id: string;
  side: string;
  stp: string;
  type: string;
  time_in_force: string;
  post_only: boolean;
  created_at: string;
  fill_fees: string;
  filled_size: string;
  executed_value: string;
  status: string;
  settled: boolean;
  canceled: boolean;
  maker: string;
  taker: string;
  pricingAvailable: boolean;
  formattedDate: string;
  formattedDateDay: string;
  formattedDateToday: string;
  displayDate: string;
  displaySize: number;
  displayPrice: number;
  displayAPIPrice: number;
  displayTotal: number;
  displayStatus: string;
  cancelable: boolean;

  constructor(props: any) {
    Object.assign(this, props);
    if (this.created_at) {
      this.formattedDate = moment(this.created_at).format('MMM DD HH:mm');
      this.formattedDateDay = moment(this.created_at).format('MMM DD');
      this.formattedDateToday = moment(this.created_at).format('HH:mm:ss');
      this.displayDate = this.datetimeFormat();
    }
    this.displaySize = Openorder.prepareNumber(parseFloat(this.size));
    this.displayPrice = Openorder.prepareNumber(this.price);
    this.displayTotal = Openorder.prepareNumber(parseFloat(this.total));
    this.displayStatus = this.simpleStatus();
    this.cancelable = Openorder.cancelable(this.status);
  }

  static createOpenOrder(props: any): Openorder {
    return new Openorder(props);
  }

  static prepareNumber(num: number): number {
    return math.round(num, 6);
  }

  static cancelable(state) {
    return ![OrderStates.Finished, OrderStates.Canceled, OrderStates.Created,
      OrderStates.RollbackFailed, OrderStates.RolledBack].includes(state);
  }

  public updatePricingAvailable(available: boolean, pricing: Pricing) {
    this.pricingAvailable = available && pricing.canGetPrice(this.maker);
    this.displayAPIPrice = Openorder.prepareNumber(pricing.getPrice(this.price, this.maker));
  }

  public simpleStatus() {
    switch (this.status) {
      case OrderStates.New:             return Localize.text('Creating order', 'openorders');
      case OrderStates.Open:            return Localize.text('Open', 'openorders');
      case OrderStates.Accepting:       return Localize.text('Exchange in progress (1/5)', 'openorders');
      case OrderStates.Hold:            return Localize.text('Exchange in progress (2/5)', 'openorders');
      case OrderStates.Initialized:     return Localize.text('Exchange in progress (3/5)', 'openorders');
      case OrderStates.Created:         return Localize.text('Exchange in progress (4/5)', 'openorders');
      case OrderStates.Committed:       return Localize.text('Exchange in progress (5/5)', 'openorders');
      case OrderStates.Finished:        return Localize.text('Complete', 'openorders');
      case OrderStates.Expired:         return Localize.text('Expired', 'openorders');
      case OrderStates.Offline:         return Localize.text('Offline', 'openorders');
      case OrderStates.Invalid:         return Localize.text('Invalid', 'openorders');
      case OrderStates.RolledBack:      return Localize.text('Order failed, refunding', 'openorders');
      case OrderStates.RollbackFailed:  return Localize.text('Order failed, not refunded', 'openorders');
      case OrderStates.Canceled:        return Localize.text('Cancelled', 'openorders');
      default:                          return this.status;
    }
  }

  public isNew()            { return this.status === OrderStates.New; }
  public isOpen()           { return this.status === OrderStates.Open; }
  public isAccepting()      { return this.status === OrderStates.Accepting; }
  public isHold()           { return this.status === OrderStates.Hold; }
  public isInitialized()    { return this.status === OrderStates.Initialized; }
  public isCreated()        { return this.status === OrderStates.Created; }
  public isCommitted()      { return this.status === OrderStates.Committed; }
  public isFinished()       { return this.status === OrderStates.Finished; }
  public isExpired()        { return this.status === OrderStates.Expired; }
  public isOffline()        { return this.status === OrderStates.Offline; }
  public isInvalid()        { return this.status === OrderStates.Invalid; }
  public isRolledBack()     { return this.status === OrderStates.RolledBack; }
  public isRollbackFailed() { return this.status === OrderStates.RollbackFailed; }
  public isCanceled()       { return this.status === OrderStates.Canceled; }


  public datetimeFormat() {
    // datetime format: 2019-01-18T21:18:05.005537Z
    if (moment(new Date()).format('MMM DD') === this.formattedDateDay) {
      // if today, show hr:min:s:ms format
      return this.formattedDateToday;
    } else {
      // if not today, show month-day-hr:min format
      return this.formattedDate;
    }
  }

}
