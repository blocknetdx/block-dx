import * as moment from 'moment';

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

  static createOpenOrder(props: any): Openorder {
    const instance = new Openorder();
    return Object.assign(instance, props);
  }

}
