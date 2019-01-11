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

  public getStatus() {
    var orderStatus = this.status;
    var simpleStatus = orderStatus;
    simpleStatus = (orderStatus == OrderStates.New)             ? 'Creating order'              : simpleStatus;
    simpleStatus = (orderStatus == OrderStates.Open)            ? 'Open'                        : simpleStatus;
    simpleStatus = (orderStatus == OrderStates.Accepting)       ? 'Exchange in progress (1/5)'  : simpleStatus;
    simpleStatus = (orderStatus == OrderStates.Hold)            ? 'Exchange in progress (2/5)'  : simpleStatus;
    simpleStatus = (orderStatus == OrderStates.Initialized)     ? 'Exchange in progress (3/5)'  : simpleStatus;
    simpleStatus = (orderStatus == OrderStates.Created)         ? 'Exchange in progress (4/5)'  : simpleStatus;
    simpleStatus = (orderStatus == OrderStates.Committed)       ? 'Exchange in progress (5/5)'  : simpleStatus;
    simpleStatus = (orderStatus == OrderStates.Finished)        ? 'Complete'                    : simpleStatus;
    simpleStatus = (orderStatus == OrderStates.Expired)         ? 'Expired'                     : simpleStatus;
    simpleStatus = (orderStatus == OrderStates.Offline)         ? 'Offline'                     : simpleStatus;
    simpleStatus = (orderStatus == OrderStates.Invalid)         ? 'Invalid'                     : simpleStatus;
    simpleStatus = (orderStatus == OrderStates.RolledBack)      ? 'Order failed, refunded'      : simpleStatus;
    simpleStatus = (orderStatus == OrderStates.RollbackFailed)  ? 'Order failed, not refunded'  : simpleStatus;
    simpleStatus = (orderStatus == OrderStates.Canceled)        ? 'Cancelled'                   : simpleStatus;
    return simpleStatus;
  }
  
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
