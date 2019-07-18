import {Component, NgZone, OnInit, ViewChild} from '@angular/core';
import 'rxjs/add/operator/map';
import * as math from 'mathjs';

import { OrderbookService } from './orderbook.service';
import { OpenordersService } from './openorders.service';
import { TableComponent } from './table/table.component';
import { AppService } from './app.service';
import { NumberFormatPipe } from './pipes/decimal.pipe';
import { BlockCurrencyPipe } from './block-currency.pipe';
import { PricingService } from './pricing.service';
import { Pricing } from './pricing';


math.config({
  number: 'BigNumber',
  precision: 64
});

const { bignumber } = math;

@Component({
  selector: 'app-orderbook',
  templateUrl: './orderbook.component.html',
  styleUrls: ['./order-book.component.scss']
})

export class OrderbookComponent implements OnInit {
  @ViewChild('orderbookTopTable') public orderbookTopTable: TableComponent;
  @ViewChild('orderbookBottomTable') public orderbookBottomTable: TableComponent;

  public sections: any[] = [
    {rows: []},
    {rows: []}
  ];
  public symbols:string[] = [];
  // public lastTradePrice = '';
  public spread = '';
  public pricingSpread = '';
  public showSpread = false;
  public priceDecimal = '6';
  public pricing: Pricing;
  public pricingAvailable = false;
  public pricingEnabled = false;

  public ownOrders = new Set();

  constructor(
    private appService: AppService,
    private numberFormatPipe: NumberFormatPipe,
    private currencyPipe: BlockCurrencyPipe,
    private orderbookService: OrderbookService,
    private openorderService: OpenordersService,
    private pricingService: PricingService,
    // private tradehistoryService: TradehistoryService,
    // private currentpriceService: CurrentpriceService,
    private zone: NgZone
  ) { }

  static calculateTotal(row) {
    return math.round(math.multiply(bignumber(row[1]), bignumber(row[0])), 6);
  }

  static scalePercentBar(size) {
    const maxWidth = 100; // percentBar CSS max-width %
    const scale = 0.4; // ratio of max width to limit to
    const multiplier = maxWidth * scale;
    if (size <= 1) {
      return ( 0.01 * multiplier );
    } else if (size <= 2.75) {
      return ( Math.log(size) * 0.09 * multiplier );
    } else {
      return ( (1 - 1 / Math.log(size)) * multiplier );
    }
  }

  ngOnInit(): void {

    const { zone } = this;

    this.appService.marketPairChanges.subscribe((symbols) => {
      zone.run(() => {
        this.symbols = symbols;
        this.updatePricingAvailable(this.pricing ? this.pricing.enabled : false);
        this.updatePricingData();
      });
    });

    this.orderbookService.getOrderbook()
      .subscribe(orderbook => {
        zone.run(() => {
          const asks = orderbook.asks;
          const bids = orderbook.bids;

          this.showSpread = !(asks.length === 0 && bids.length === 0);

          // Append the total, scalebar, pricing to the existing data provider
          this.sections = [
            {rows: asks.map(a => a.concat([
              OrderbookComponent.scalePercentBar(a[3]), this.pricingAvailable ? this.pricing.getPrice(a[0], this.symbols[1]) : 0
            ]))},
            {rows: bids.map(b => b.concat([
              OrderbookComponent.scalePercentBar(b[3]), this.pricingAvailable ? this.pricing.getPrice(b[0], this.symbols[1]) : 0
            ]))},
          ];

          let spread;
          if(asks.length > 0 && bids.length > 0) {
            const bestAsk = bignumber(asks[asks.length - 1][0]);
            const bestBid = bignumber(bids[0][0]);
            spread = String(math.subtract(bestAsk, bestBid));
          } else {
            spread = '';
          }
          this.spread = spread;
          this.updatePricingData();

          this.orderbookTopTable.scrollToBottom();
        });
      });

    this.orderbookService.getPriceDecimal()
      .subscribe(priceDecimal => {
        this.zone.run(() => {
          this.priceDecimal = priceDecimal;
          this.updatePricingData();
        });
      });

    this.pricingService.getPricing().subscribe(pricing => {
      zone.run(() => {
        this.pricing = pricing;
        this.updatePricingAvailable(pricing.enabled);
        this.updatePricingData();
      });
    });
    this.pricingService.getPricingEnabled().subscribe(enabled => {
      zone.run(() => {
        this.pricingEnabled = enabled;
      });
    });

    this.openorderService.getOpenorders().subscribe(openorders => {
      zone.run(() => {
        this.ownOrders = new Set(openorders.map(o => o.id));
      });
    });

    // this.currentpriceService.currentprice.subscribe((cp) => {
    //   zone.run(() => {
    //     this.lastTradePrice = cp.last;
    //   });
    // });

  }

  updatePricingAvailable(enabled: boolean) {
    this.pricingAvailable = enabled && this.pricing.canGetPrice(this.symbols[1]);
  }

  updatePricingData() {
    const { pricingEnabled, pricingAvailable, pricing, symbols } = this;
    const [ section1, section2 ] = this.sections;
    const { rows: asks } = section1;
    const { rows: bids } = section2;

    if(asks.length > 0 && bids.length > 0 && pricingEnabled && pricingAvailable && pricing) {
      const askPrice = pricing.getPrice(asks[asks.length - 1][0], symbols[1]);
      const bidPrice = pricing.getPrice(bids[0][0], symbols[1]);
      this.pricingSpread = String(math.subtract(bignumber(askPrice), bignumber(bidPrice)));
      // console.log('pricingSpread', this.pricingSpread);
    } else {
      this.pricingSpread = '';
    }

    // Update the pricing on bid/asks
    if (this.pricing) {
      this.sections[0].rows.forEach(ask => {
        ask[8] = this.pricing.getPrice(ask[0], this.symbols[1]);
      });
      this.sections[1].rows.forEach(bid => {
        bid[8] = this.pricing.getPrice(bid[0], this.symbols[1]);
      });
    }
  }

  onTakeOrder(row) {
    if (row) {
      if(this.ownOrders.has(row[2])) {
        alert('You are unable to take your own order.');
      } else {
        this.orderbookService.takeOrder(row);
      }
    }
  }

  onRowSelect(row) {
    if (row) {
      if(this.ownOrders.has(row[2])) {
        const newRow = [...row];
        newRow[2] = '';
        this.orderbookService.requestOrder(newRow);
        setTimeout(() => {
          alert('You are unable to take your own order.');
        }, 100);
      } else {
        this.orderbookService.requestOrder(row);
      }
    }
  }

  onCancelOrder(orderId) {
    const { electron } = window;
    electron.ipcRenderer
      .send('cancelOrder', orderId);
  }

  onRowContextMenu({ row, clientX, clientY }) {
    const { Menu } = window.electron.remote;
    const { clipboard, ipcRenderer } = window.electron;

    const orderId = row[2];

    const ownOrder = this.ownOrders.has(orderId);
    const menuTemplate = [];

    menuTemplate.push({
      label: 'Copy Order ID',
      click: () => {
        clipboard.writeText(orderId);
      }
    });
    menuTemplate.push({
      label: 'View Details',
      click: () => {
        ipcRenderer.send('openOrderDetailsWindow', orderId);
      }
    });
    menuTemplate.push({
      type: 'separator'
    });
    if(ownOrder) {
      menuTemplate.push({
        label: 'Cancel Order',
        click: () => {
          const confirmed = confirm('Are you sure that you want to cancel this order?');
          if(confirmed) this.onCancelOrder(orderId);
        }
      });
    } else {
      menuTemplate.push({
        label: 'Take Order',
        click: () => {
          this.onTakeOrder(row);
        }
      });
    }

    const menu = Menu.buildFromTemplate(menuTemplate);
    menu.popup({x: clientX, y: clientY});
  }

}
