import * as math from 'mathjs';
import * as moment from 'moment';

export class Trade {
  public time: string;
  public trade_id: number;
  public price: string;
  public size: string;
  public side: string;
  public displaySize: number;
  public displayAmount: number;
  public displayPrice: number;
  public formattedDate: string;
  public formattedDateDay: string;
  public formattedDateToday: string;
  public displayDate: string;

  constructor(props) {
    Object.assign(this, props);
    const validTime = this.time && this.time !== '';
    this.displaySize = Trade.prepareNumber(parseFloat(this.size));
    this.displayAmount = Trade.prepareNumber(parseFloat(this.price)/parseFloat(this.size));
    this.displayPrice = Trade.prepareNumber(parseFloat(this.price));
    this.formattedDate = validTime ? moment(this.time).format('MMM DD HH:mm') : '';
    this.formattedDateDay = validTime ? moment(this.time).format('MMM DD') : '';
    this.formattedDateToday = validTime ? moment(this.time).format('HH:mm:ss') : '';
    this.displayDate = this.datetimeFormat();
  }

  public static fromObject(obj: any): Trade {
    return new Trade(obj);
  }

  static prepareNumber(num: number): number {
    return math.round(num, 6);
  }

  public datetimeFormat(): string {
    // datetime format: 2019-01-18T21:18:05.005537Z
    if (moment(new Date()).format('MMM DD') === this.formattedDateDay) {
      // if today, show hr:min:s:ms format
      return this.formattedDateToday;
    } else {
      // if not today, show month-day-hr:min format
      return this.formattedDate;
    }
  }

  public get priceClasses(): string {
    const color = this.side === 'buy' ? 'color-red' : 'color-green';
    return [this.side, color].join(' ');
  }

  public get percentbarClasses(): string {
    const color = this.side === 'buy' ? 'bg-red' : 'bg-green';
    return [this.side, color].join(' ');
  }
}
