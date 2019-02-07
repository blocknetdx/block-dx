import * as moment from 'moment';
import * as OrderStates from '../orderstates';

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

  public formattedDate() {
    return moment(this.created_at).format('MMM DD HH:mm');
  }

  public simpleStatus() {
    switch (this.status) {
      case OrderStates.New:             return `Creating order`;
      case OrderStates.Open:            return `Open`;
      case OrderStates.Accepting:       return `Exchange in progress (1/5)`;
      case OrderStates.Hold:            return `Exchange in progress (2/5)`;
      case OrderStates.Initialized:     return `Exchange in progress (3/5)`;
      case OrderStates.Created:         return `Exchange in progress (4/5)`;
      case OrderStates.Committed:       return `Exchange in progress (5/5)`;
      case OrderStates.Finished:        return `Complete`;
      case OrderStates.Expired:         return `Expired`;
      case OrderStates.Offline:         return `Offline`;
      case OrderStates.Invalid:         return `Invalid`;
      case OrderStates.RolledBack:      return `Order failed, refunding`;
      case OrderStates.RollbackFailed:  return `Order failed, not refunded`;
      case OrderStates.Canceled:        return `Cancelled`;
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
    //datetime format: 2019-01-18T21:18:05.005537Z
    var datetime = this.created_at;
    if (moment(new Date()).format('MMM DD')==moment(datetime).format('MMM DD')) {
      // if today, show hr:min:s:ms format
      return moment(datetime).format('HH:mm:ss');
    } else {
      // if not today, show month-day-hr:min format
      return moment(datetime).format('MMM DD HH:mm');
    }
  }

  static createOpenOrder(props: any): Openorder {
    const instance = new Openorder();
    return Object.assign(instance, props);
  }

}
