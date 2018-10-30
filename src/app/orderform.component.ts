import { Component, Input, ViewChild, OnInit, NgZone } from '@angular/core';
import * as math from 'mathjs';
import { PerfectScrollbarComponent, PerfectScrollbarDirective } from 'ngx-perfect-scrollbar';

import { AppService } from './app.service';
import { Currentprice } from './currentprice';
import { CurrentpriceService } from './currentprice.service';
import { OrderbookService } from './orderbook.service';
import { TabViewComponent } from './tab-view/tab-view.component';
import { SelectComponent } from './select/select.component';
import {NumberFormatPipe} from './pipes/decimal.pipe';
import { PricingService } from './pricing.service';
import { Pricing } from './pricing';

math.config({
  number: 'BigNumber',
  precision: 64
});

@Component({
  selector: 'app-orderform',
  templateUrl: './orderform.component.html',
  styleUrls: ['./orderform.component.scss']
})
export class OrderformComponent implements OnInit {
  @ViewChild('tabView') public tabView: TabViewComponent;
  @ViewChild('typeSelect') public typeSelect: SelectComponent;

  @ViewChild('scrollbar')

  public scrollbar: PerfectScrollbarDirective;
  public symbols:string[] = [];
  public currentPrice: Currentprice;
  public totalPrice = 0;
  public orderTypes: any[];
  public selectedOrderType: any;
  public model: any;
  public addresses: {};
  public disableSubmit = false;
  public Number = Number;

  public amountPopperText: string;
  public amountPopperShow = false;

  public totalPopperText: string;
  public totalPopperShow = false;

  // number limits for order amount and total in order form
  private upperLimit = 9;
  private precisionLimit = 6;

  public pricing: Pricing;
  public pricingEnabled = false;
  public pricingAvailable = false;

  constructor(
    private numberFormatPipe: NumberFormatPipe,
    private appService: AppService,
    private currentpriceService: CurrentpriceService,
    private orderbookService: OrderbookService,
    private pricingService: PricingService,
    private zone: NgZone
  ) { }

  ngOnInit() {
    this.model = {};

    this.addresses = window.electron.ipcRenderer.sendSync('getAddressesSync');

    this.appService.marketPairChanges.subscribe((symbols) => {
      this.symbols = symbols;
      // this.model = {};
      this.resetModel();
    });
    this.currentpriceService.currentprice.subscribe((cp) => {
      this.currentPrice = cp;
    });

    this.orderbookService.requestedOrder
      .subscribe((order) => {
        this.zone.run(() => {
          const tabIndex = order[4] === 'ask' ? 0 : 1;
          this.tabView.activeTab = this.tabView.tabs[tabIndex];
          this.resetModel();
          this.model = Object.assign(this.model, {
            id: order[2],
            amount: this.formatNumber(String(order[1]), this.symbols[0]),
            totalPrice: this.formatNumber(String(math.multiply(order[0], order[1])), this.symbols[1]),
            price: this.formatNumber(String(order[0]), this.symbols[1]),
            secondPrice: this.formatNumber(this.fixAmount(String(this.pricing.getPrice(order[0], this.symbols[1]))), 'BTC')
            // totalPrice: this.formatNumber(String(order[0] * order[1]), this.symbols[1])
          });
        });
      });

    this.pricingService.getPricing().subscribe(pricing => {
      this.zone.run(() => {
        this.pricing = pricing;
        this.pricingAvailable = pricing.enabled;
      });
    });
    this.pricingService.getPricingEnabled().subscribe(enabled => {
      this.zone.run(() => {
        this.pricingEnabled = enabled;
      });
    });

    this.orderTypes = [
      { value: 'exact', viewValue: 'Exact Order'}
    ];
  }

  fixAmount(numStr: string): string {
    numStr = numStr.replace(/[^\d.]/g, '');
    const { upperLimit, precisionLimit } = this;
    const sides = numStr.split('.');
    const int = sides[0] || '0';
    const dec = sides[1] || '';
    if(!dec) {
      return int.slice(0, upperLimit);
    } else {
      return int.slice(0, upperLimit) + '.' + dec.slice(0, precisionLimit);
    }
  }

  validAmount(numStr: string): any {
    const { upperLimit, precisionLimit } = this;
    const numPatt = /^(\d*)\.?(\d*)$/;
    if(!numPatt.test(numStr)) {
      return [ false, true ];
    }
    const matches = numStr.match(numPatt);
    const int = matches[1] || '';
    if(int.length > upperLimit) return [ false ];
    const dec = matches[2] || '';
    if(dec.length > precisionLimit) return [ false ];
    return [ true ];
  }

  showPopper(type: string, text: string, duration: number) {
    let showProp, textProp;
    switch(type) {
      case 'amount':
        showProp = 'amountPopperShow';
        textProp = 'amountPopperText';
        break;
      case 'total':
        showProp = 'totalPopperShow';
        textProp = 'totalPopperText';
        break;
    }
    this[textProp] = text;
    this[showProp] = true;
    setTimeout(() => {
      this[showProp] = false;
    }, duration);
  }

  amountChanged(e) {
    e.preventDefault();
    this.model.id = '';
    let { value: amount } = e.target;
    const { price = '' } = this.model;
    const [ valid, skipPopper = false ] = this.validAmount(amount);
    let fixed;
    if(!valid) {
      fixed = this.fixAmount(amount);
      if(!skipPopper) this.showPopper('amount', 'You can only specify amounts with at most 0.000001 precision.', 5000);
      e.target.value = fixed;
    }
    if(!amount) {
      this.model.totalPrice = '';
      return;
    }
    amount = fixed ? fixed : amount;
    if(price) {
      const newTotalPrice = String(math.multiply(amount, price));
      this.model.totalPrice = this.formatNumber(this.fixAmount(String(newTotalPrice)), 'BTC');
    } else {
      this.model.totalPrice = '';
    }
  }

  priceChanged(e) {
    e.preventDefault();
    const type = this.tabView.activeIndex === 0 ? 'buy' : 'sell';
    this.model.id = '';
    let { value: price } = e.target;
    const { amount = '', totalPrice = '' } = this.model;
    const [ valid, skipPopper = false ] = this.validAmount(price);
    let fixed;
    if(!valid) {
      fixed = this.fixAmount(price);
      if(!skipPopper) this.showPopper('price', 'You can only specify prices with at most 0.000001 precision.', 5000);
      e.target.value = fixed;
    }
    if(!price) {
      this.model.totalPrice = '';
      this.model.secondPrice = '';
      return;
    }
    price = fixed ? fixed : price;
    this.model.secondPrice = this.formatNumber(this.fixAmount(String(this.pricing.getPrice(price, this.symbols[1]))), 'BTC');
    if(amount) {
      const newTotalPrice = String(math.multiply(amount, price));
      this.model.totalPrice = this.formatNumber(this.fixAmount(String(newTotalPrice)), 'BTC');
    } else {
      this.model.totalPrice = '';
    }
  }

  secondPriceChanged(e) {
    e.preventDefault();
    const type = this.tabView.activeIndex === 0 ? 'buy' : 'sell';
    this.model.id = '';
    let { value: secondPrice } = e.target;
    const { amount = '', totalPrice = '' } = this.model;
    const [ valid, skipPopper = false ] = this.validAmount(secondPrice);
    let fixed;
    if(!valid) {
      fixed = this.fixAmount(secondPrice);
      if(!skipPopper) this.showPopper('price', 'You can only specify prices with at most 0.000001 precision.', 5000);
      e.target.value = fixed;
    }
    if(!secondPrice) {
      this.model.totalPrice = '';
      this.model.price = '';
      return;
    }
    secondPrice = fixed ? fixed : secondPrice;
    const price = this.formatNumber(this.fixAmount(String(this.pricing.getFromBasePrice(secondPrice, this.symbols[1]))), 'BTC');
    this.model.price = price;
    if(amount) {
      const newTotalPrice = String(math.multiply(amount, price));
      this.model.totalPrice = this.formatNumber(this.fixAmount(String(newTotalPrice)), 'BTC');
    } else {
      this.model.totalPrice = '';
    }
  }

  makerAddressChanged(e) {
    e.preventDefault();
    this.model.makerAddress = e.target.value;
    this.updateStoredAddresses(this.model.makerAddress.trim(), null);
  }

  takerAddressChanged(e) {
    e.preventDefault();
    this.model.takerAddress = e.target.value;
    this.updateStoredAddresses(null, this.model.takerAddress.trim());
  }

  updateStoredAddresses(makerAddress, takerAddress) {
    this.addresses = Object.assign({}, this.addresses, {
      [this.symbols[0]]: makerAddress ? makerAddress : this.model.makerAddress.trim(),
      [this.symbols[1]]: takerAddress ? takerAddress : this.model.takerAddress.trim()
    });
  }

  onNumberInputBlur(e, field) {
    const { value } = e.target;
    const emptyOrZero = (s => /^0*\.?0*$/.test(s) || /^\s*$/.test(s));
    if (value === '.' || emptyOrZero(value)) {
      this.model[field] = '';
    } else {
      this.model[field] = this.formatNumber(value, field === 'amount' ? this.symbols[0] : this.symbols[1]);
    }
  }

  upperCheck(num: string) {
    const splitNum = num.split('.');
    if(splitNum[0].length > this.upperLimit) {
      splitNum[0] = splitNum[0].slice(-1 * this.upperLimit);
    }
    return splitNum.join('.');
  }

  formatNumber(num:string, symbol:string): string {
    // strip leading 0s
    if (/[0-9]*\.?[0-9]*/.test(num)) {
      const n = math.bignumber(num);
      num = n.toString();
    }
    const format = symbol !== 'USD' ? `1.${this.precisionLimit}-${this.precisionLimit}` : '1.2-2';
    const formattedNumber = this.numberFormatPipe.transform(num, format);
    return this.upperCheck(formattedNumber);
  }

  calcPrice(event: any) { // without type info
    const enteredValue = event.target.value;
    const currPrice = parseFloat(this.currentPrice.last);
    this.totalPrice = enteredValue * currPrice;
  }

  resetModel() {
    this.model = {
      id: '',
      amount: '',
      price: '',
      secondPrice: '',
      totalPrice: '',
      makerAddress: this.addresses[this.symbols[0]] || '',
      takerAddress: this.addresses[this.symbols[1]] || ''
    };
  }

  validateNumber(numStr = '') {
    numStr = numStr.trim();
    return /\d+/.test(numStr) && /^\d*\.?\d*$/.test(numStr) && Number(numStr) > 0;
  }

  onOrderSubmit() {

    let { makerAddress = '', takerAddress = '', amount = '', totalPrice = '' } = this.model;

    if(makerAddress === takerAddress) {
      alert(`Oops! You have the same address entered for both ${this.symbols[0]} and ${this.symbols[1]}.`);
      return;
    }

    this.disableSubmit = true;

    const { ipcRenderer } = window.electron;
    const type = this.tabView.activeIndex === 0 ? 'buy' : 'sell';
    console.log('Submit order', type, this.model);
    const { id } = this.model;
    makerAddress = makerAddress.trim();
    takerAddress = takerAddress.trim();
    amount = amount.trim();
    totalPrice = totalPrice.trim();

    if(
      !makerAddress ||
      !takerAddress ||
      !amount ||
      !this.validateNumber(amount) ||
      !totalPrice ||
      !this.validateNumber(totalPrice)
    ) return;

    this.updateStoredAddresses(makerAddress, takerAddress);

    ipcRenderer.once('orderDone', (e, state) => {
      this.zone.run(() => {
        this.disableSubmit = false;
      });
      if(state === 'success') {
        ipcRenderer.send('saveAddress', this.symbols[0], makerAddress);
        ipcRenderer.send('saveAddress', this.symbols[1], takerAddress);
        this.resetModel();
      } else if (state === 'failed') {
        alert('There was a problem with your order.');
      }
    });

    // setTimeout(() => {
      if(id) { // take order
        if(type === 'buy') {
          ipcRenderer.send('takeOrder', {
            id,
            sendAddress: takerAddress,
            receiveAddress: makerAddress
          });
        } else if(type === 'sell') {
          ipcRenderer.send('takeOrder', {
            id,
            sendAddress: makerAddress,
            receiveAddress: takerAddress
          });
        }
      } else { // make order
        if(type === 'buy') {
          ipcRenderer.send('makeOrder', {
            maker: this.symbols[1],
            makerSize: totalPrice,
            makerAddress: takerAddress,
            taker: this.symbols[0],
            takerSize: amount,
            takerAddress: makerAddress,
            type: 'exact'
          });
        } else if(type === 'sell') {
          ipcRenderer.send('makeOrder', {
            maker: this.symbols[0],
            makerSize: amount,
            makerAddress: makerAddress,
            taker: this.symbols[1],
            takerSize: totalPrice,
            takerAddress: takerAddress,
            type: 'exact'
          });
        }
      }
    // }, 0);
  }
}
