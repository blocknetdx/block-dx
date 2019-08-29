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
import {ConfigurationOverlayService} from './configuration.overlay.service';
import { shouldHidePricing } from './util';

math.config({
  number: 'BigNumber',
  precision: 64
});

const { bignumber } = math;

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

  public amountPopperText: string;
  public amountPopperShow = false;

  public totalPopperText: string;
  public totalPopperShow = false;

  public formatNumberSymbol0: string; // defaults for gui (see resetModel)
  public formatNumberSymbol1: string;

  // number limits for order amount and total in order form
  private upperLimit = 9;
  private precisionLimit = 6;

  public pricing: Pricing;
  public pricingEnabled = false;
  public pricingAvailable = false;
  public showConfigurationOverlay = false;

  shouldHidePricing = shouldHidePricing;

  constructor(
    private numberFormatPipe: NumberFormatPipe,
    private appService: AppService,
    private currentpriceService: CurrentpriceService,
    private orderbookService: OrderbookService,
    private pricingService: PricingService,
    private configurationOverlayService: ConfigurationOverlayService,
    private zone: NgZone
  ) { }

  ngOnInit() {
    this.model = {};

    this.addresses = window.electron.ipcRenderer.sendSync('getAddressesSync');

    this.appService.marketPairChanges.subscribe((symbols) => {
      this.symbols = symbols;
      this.resetModel();
    });
    this.currentpriceService.currentprice.subscribe((cp) => {
      this.currentPrice = cp;
    });

    this.orderbookService.takenOrder
      .subscribe((order) => {
        const id = order[2];
        const amount = this.formatNumber(String(order[1]), this.symbols[0]);
        const totalPrice = this.formatNumber(order[5], this.symbols[1]);
        const type = order[4] === 'ask' ? 'buy' : 'sell';
        this.onOrderSubmit(id, amount, totalPrice, type);
      });

    this.orderbookService.requestedOrder
      .subscribe((order) => {
        this.zone.run(() => {
          const tabIndex = order[4] === 'ask' ? 0 : 1;
          this.tabView.activeTab = this.tabView.tabs[tabIndex];
          this.resetModel();
          const secondPrice = this.pricing.canGetPrice(this.symbols[1]) ? this.formatNumber(this.fixAmount(String(this.pricing.getPrice(order[0], this.symbols[1]))), 'BTC') : 0;
          this.model = Object.assign(this.model, {
            id: order[2],
            amount: this.formatNumber(String(order[1]), this.symbols[0]),
            totalPrice: this.formatNumber(order[5], this.symbols[1]),
            price: this.formatNumber(String(order[0]), this.symbols[1]),
            secondPrice
            // totalPrice: this.formatNumber(String(order[0] * order[1]), this.symbols[1])
          });
        });
      });

    this.pricingService.getPricing().subscribe(pricing => {
      this.zone.run(() => {
        this.pricing = pricing;
        this.updatePricingAvailable(pricing.enabled);
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

    this.configurationOverlayService.showConfigurationOverlay()
      .subscribe(show => {
        this.zone.run(() => {
          this.showConfigurationOverlay = show;
        });
      });

  }

  updatePricingAvailable(enabled: boolean) {
    this.pricingAvailable = enabled && this.pricing.canGetPrice(this.symbols[1]);
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
      case 'price':
        showProp = 'pricePopperShow';
        textProp = 'pricePopperText';
        break;
      case 'secondPrice':
        showProp = 'secondPricePopperShow';
        textProp = 'secondPricePopperText';
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
    let amount;
    if(e.type === 'paste') {
      amount = window.electron.clipboard.readText();
    } else {
      amount = e.target.value;
    }
    amount = amount === '.' ? '0.' : amount;
    const { price = '' } = this.model;
    const [ valid, skipPopper = false ] = this.validAmount(amount);
    let fixed;
    if(!valid) {
      fixed = this.fixAmount(amount);
      if(!skipPopper) this.showPopper('amount', 'You can only specify amounts with at most 6 decimal places.', 5000);
      e.target.value = fixed;
    } else if(e.type === 'paste') {
      e.target.value = amount;
    }
    if(!amount) {
      this.model.totalPrice = '';
      return;
    }
    amount = fixed ? fixed : amount;
    if(price) {
      const newTotalPrice = String(math.multiply(bignumber(amount), bignumber(price)));
      this.model.totalPrice = this.formatNumber(String(newTotalPrice), 'BTC');
    } else {
      this.model.totalPrice = '';
    }
  }

  priceChanged(e) {
    e.preventDefault();
    const type = this.tabView.activeIndex === 0 ? 'buy' : 'sell';
    this.model.id = '';
    let price;
    if(e.type === 'paste') {
      price = window.electron.clipboard.readText();
    } else {
      price = e.target.value;
    }
    price = price === '.' ? '0.' : price;
    const { amount = '', totalPrice = '' } = this.model;
    const [ valid, skipPopper = false ] = this.validAmount(price);
    let fixed;
    if(!valid) {
      fixed = this.fixAmount(price);
      if(!skipPopper) this.showPopper('price', 'You can only specify amounts with at most 6 decimal places.', 5000);
      e.target.value = fixed;
    } else if(e.type === 'paste') {
      e.target.value = price;
    }
    const numeric = new Set(['0','1','2','3','4','5','6','7','8','9','.','Decimal','Backspace']);
    if (!numeric.has(e.key)) return; // do not calculate price if not a numeric key
    if(!price) {
      this.model.totalPrice = '';
      this.model.secondPrice = '';
      return;
    }
    price = fixed ? fixed : price;
    this.model.secondPrice = this.pricing.canGetPrice(this.symbols[1]) ? this.formatNumber(this.fixAmount(String(this.pricing.getPrice(price, this.symbols[1]))), 'BTC') : '0';
    if(amount) {
      const newTotalPrice = String(math.multiply(bignumber(amount), bignumber(price)));
      this.model.totalPrice = this.formatNumber(String(newTotalPrice), 'BTC');
    } else {
      this.model.totalPrice = '';
    }
  }

  secondPriceChanged(e) {
    e.preventDefault();
    const type = this.tabView.activeIndex === 0 ? 'buy' : 'sell';
    this.model.id = '';
    let secondPrice;
    if(e.type === 'paste') {
      secondPrice = window.electron.clipboard.readText();
    } else {
      secondPrice = e.target.value;
    }
    secondPrice = secondPrice === '.' ? '0.' : secondPrice;
    const { amount = '', totalPrice = '' } = this.model;
    const [ valid, skipPopper = false ] = this.validAmount(secondPrice);
    let fixed;
    if(!valid) {
      fixed = this.fixAmount(secondPrice);
      if(!skipPopper) this.showPopper('secondPrice', 'You can only specify amounts with at most 6 decimal places.', 5000);
      e.target.value = fixed;
    } else if(e.type === 'paste') {
      e.target.value = secondPrice;
    }
    const numeric = new Set(['0','1','2','3','4','5','6','7','8','9','.','Decimal','Backspace']);
    if (!numeric.has(e.key)) return; // do not calculate price if not a numeric key
    if(!secondPrice) {
      this.model.totalPrice = '';
      this.model.price = '';
      return;
    }
    secondPrice = fixed ? fixed : secondPrice;
    const price = this.formatNumber(String(this.pricing.getFromBasePrice(secondPrice, this.symbols[1])), 'BTC');
    this.model.price = price;
    if(amount) {
      const newTotalPrice = String(math.multiply(bignumber(amount), bignumber(price)));
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
    this.formatNumberSymbol0 = this.formatNumber('0', this.symbols[0]);
    this.formatNumberSymbol1 = this.formatNumber('0', this.symbols[1]);
  }

  validateNumber(numStr = '') {
    numStr = numStr.trim();
    return /\d+/.test(numStr) && /^\d*\.?\d*$/.test(numStr) && Number(numStr) > 0;
  }

  onOrderSubmit(id = '', amount = '', totalPrice = '', type = '') {

    let { makerAddress = '', takerAddress = '' } = this.model;

    const orderformOrder = id ? false : true;

    if(orderformOrder) {
      id = this.model.id || id;
      amount = this.model.amount || amount;
      totalPrice = this.model.totalPrice || totalPrice;
    }

    if(!amount) {
      alert('Oops! You must enter an amount.');
      return;
    } else if(!totalPrice) {
      alert('Oops! You must enter a price.');
      return;
    } else if(!makerAddress) {
      alert(`Oops! You must enter a ${this.symbols[0]} address.`);
      return;
    } else if(!takerAddress) {
      alert(`Oops! You must enter a ${this.symbols[1]} address.`);
      return;
    } else if(makerAddress === takerAddress) {
      alert(`Oops! You have the same address entered for both ${this.symbols[0]} and ${this.symbols[1]}.`);
      return;
    }

    if(orderformOrder) {
      this.disableSubmit = true;
      setTimeout(() => {
        this.zone.run(() => {
          this.disableSubmit = false;
        });
      }, 1000);
      type = this.tabView.activeIndex === 0 ? 'buy' : 'sell';
    }

    const { ipcRenderer } = window.electron;
    console.log('Submit order', type, this.model);
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
      if(state === 'success') {
        ipcRenderer.send('saveAddress', this.symbols[0], makerAddress);
        ipcRenderer.send('saveAddress', this.symbols[1], takerAddress);
        if(orderformOrder) this.resetModel();
      } else if (state === 'failed') {
        alert('There was a problem with your order.');
      }
    });

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
  }

  onTabChange() {
    this.model.id = '';
  }

  openConfigurationWindow() {
    window.electron.ipcRenderer.send('openConfigurationWizard');
  }

}
