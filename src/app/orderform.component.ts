import { Component, Input, ViewChild, OnInit, NgZone } from '@angular/core';
import * as math from 'mathjs';
import { PerfectScrollbarComponent, PerfectScrollbarDirective } from 'ngx-perfect-scrollbar';
import isBoolean from 'lodash/isBoolean';

import { AppService } from './app.service';
import { Currentprice } from './currentprice';
import { CurrentpriceService } from './currentprice.service';
import { OrderbookService } from './orderbook.service';
import { TabViewComponent } from './tab-view/tab-view.component';
import { SelectComponent } from './select/select.component';
import {NumberFormatPipe} from './pipes/decimal.pipe';
import { LocalizeDecimalSeparatorPipe } from './localize/localize-decimal-separator.pipe';
import { PricingService } from './pricing.service';
import { Pricing } from './pricing';
import {ConfigurationOverlayService} from './configuration.overlay.service';
import {alert, minAmountToPrice, shouldHidePricing} from './util';
import {Localize} from './localize/localize.component';
import {logger} from './modules/logger';
import {BalancesService} from './balances.service';
import {Balance} from './balance';
import {OrderformService} from './orderform.service';

const delocalize = (numStr = '') => {
  const decimalSeparator = Localize.decimalSeparator();
  return decimalSeparator === '.' ? numStr : numStr.replace(decimalSeparator, '.');
};
const relocalize = (numStr = '') => {
  const decimalSeparator = Localize.decimalSeparator();
  return numStr.replace('.', decimalSeparator);
};

math.config({
  number: 'BigNumber',
  precision: 64
});

const { bignumber } = math;

const orderTypes = {
  PARTIAL: 'PARTIAL',
  EXACT: 'EXACT',
};

@Component({
  selector: 'app-orderform',
  templateUrl: './orderform.component.html',
  styleUrls: ['./orderform.component.scss']
})
export class OrderformComponent implements OnInit {
  @ViewChild('tabView', {static: false}) public tabView: TabViewComponent;
  @ViewChild('typeSelect', {static: false}) public typeSelect: SelectComponent;

  @ViewChild('scrollbar', {static: false})

  public amountPercent: number;
  private balances:Balance[] = [];
  public scrollbar: PerfectScrollbarDirective;
  public symbols:string[] = [];
  public currentPrice: Currentprice;
  public totalPrice = 0;
  public model: any;
  public addresses: {};
  public disableSubmit = false;

  public amountPopperText: string;
  public amountPopperShow = false;
  public minAmountPopperText: string;
  public minAmountPopperShow = false;
  public pricePopperText: string;
  public pricePopperShow = false;
  public secondPricePopperText: string;
  public secondPricePopperShow = false;

  public totalPopperText: string;
  public totalPopperShow = false;

  public formatNumberSymbol0: string; // defaults for gui (see resetModel)
  public formatNumberSymbol1: string;

  // number limits for order amount and total in order form
  private upperLimit = 9;
  private precisionLimit = 6;

  public pricing: Pricing;
  public pricingEnabled = true;
  public pricingAvailable = true;
  public showConfigurationOverlay = false;
  public autoGenerateAddressesAvailable = true;

  public exactOrderType = 'exact';
  public partialOrderType = 'partial';

  shouldHidePricing = shouldHidePricing;

  constructor(
    private numberFormatPipe: NumberFormatPipe,
    private appService: AppService,
    private currentpriceService: CurrentpriceService,
    private orderbookService: OrderbookService,
    private pricingService: PricingService,
    private configurationOverlayService: ConfigurationOverlayService,
    private balancesService: BalancesService,
    private zone: NgZone,
    private orderformService: OrderformService,
  ) {
    this.onSliderChange = this.onSliderChange.bind(this);
  }

  public Localize = Localize;

  ngOnInit() {

    this.amountPercent = 0;

    this.model = {
      orderType: this.partialOrderType,
      repost: true,
    };

    const { ipcRenderer } = window.electron;

    this.autoGenerateAddressesAvailable = ipcRenderer.sendSync('autoGenerateAddressesAvailable');

    this.addresses = ipcRenderer.sendSync('getAddressesSync');
    ipcRenderer.on('updatedAddresses', (e, addresses) => {
      this.zone.run(() => {
        this.addresses = addresses;
        this.model.makerAddress = this.addresses[this.symbols[0]] || '';
        this.model.takerAddress = this.addresses[this.symbols[1]] || '';
      });
    });

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
          // console.log('order', order);
          const tabIndex = order[4] === 'ask' ? 0 : 1;
          this.tabView.activeTab = this.tabView.tabs[tabIndex];
          this.resetModel();
          const secondPrice = this.pricing.canGetPrice(this.symbols[1]) ? this.formatNumber(this.fixAmount(String(this.pricing.getPrice(order[0], this.symbols[1]))), 'BTC') : 0;
          this.model = Object.assign(this.model, {
            id: order[2],
            amount: this.formatNumber(String(order[1]), this.symbols[0]),
            totalPrice: this.formatNumber(order[5], this.symbols[1]),
            price: this.formatNumber(String(order[0]), this.symbols[1]),
            secondPrice,
            orderType: this.exactOrderType,
            minAmount: Number(order[7]) ? this.formatNumber(String(order[7]), this.symbols[0]) : this.formatNumber(String(order[1]), this.symbols[0]),
            // totalPrice: this.formatNumber(String(order[0] * order[1]), this.symbols[1])
          });
          this.amountPercent = 0;
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

    this.balancesService.getBalances().subscribe(balances => {
      this.balances = balances;
    });

    this.orderformService.getResetOrderForm().subscribe(() => {
      this.resetModel(false);
    });

  }

  selectOrderType(orderType) {
    this.model.orderType = orderType;
  }

  toggleAutomaticallyRepostOrder(e) {
    e.preventDefault();
    if(this.model.orderType === this.partialOrderType) {
      this.model.repost = this.model.repost ? false : true;
    }
  }

  async setAmountPercent(value) {
    const balance = this.balances.find(b => b.coin === this.symbols[0]);
    if(!balance) return 0;
    this.model.id = '';
    this.amountPercent = value;
    const newAmount = math.multiply(bignumber(value / 100), bignumber(Number(balance.amount)));
    const preppedAmount = this.fixAmount(newAmount.toString());
    this.model.amount = this.formatNumber(preppedAmount, 'BTC');
    const { price = '' } = this.model;
    if(price) {
      const newTotalPrice = String(math.multiply(bignumber(Number(preppedAmount)), bignumber(price)));
      this.model.totalPrice = this.formatNumber(String(newTotalPrice), 'BTC');
    } else {
      this.model.totalPrice = '';
    }
    if(this.model.orderType === this.partialOrderType) {
      const newMinAmount = this.generateMinAmountFromAmount(Number(preppedAmount));
      this.model.minAmount = this.formatNumber(String(newMinAmount), 'BTC');
    }
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
      case 'minAmount':
        showProp = 'minAmountPopperShow';
        textProp = 'minAmountPopperText';
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
    if(
      this.model.id &&
      this.model.orderType === this.exactOrderType &&
      this.model.amount === this.model.minAmount
    ) {
      this.model.id = '';
      this.model.orderType = this.partialOrderType;
    }
    this.amountPercent = 0;
    let amount;
    if(e.type === 'paste') {
      amount = window.electron.clipboard.readText();
    } else {
      amount = e.target.value;
    }
    amount = delocalize(amount);
    amount = amount === '.' ? '0.' : amount;
    const { price = '' } = this.model;
    const [ valid, skipPopper = false ] = this.validAmount(amount);
    let fixed;
    if(!valid) {
      fixed = this.fixAmount(amount);
      if(!skipPopper) this.showPopper('amount', Localize.text('You can only specify amounts with at most 6 decimal places.', 'orderform'), 5000);
      e.target.value = relocalize(fixed);
    } else if(e.type === 'paste') {
      e.target.value = relocalize(amount);
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
    if(this.model.orderType === this.partialOrderType) {
      const newMinAmount = this.generateMinAmountFromAmount(amount);
      this.model.minAmount = this.formatNumber(String(newMinAmount), 'BTC');
    }
  }

  generateMinAmountFromAmount(amount = 0) {
    return math.multiply(bignumber(amount), bignumber(.1));
  }

  minAmountChanged(e) {
    e.preventDefault();
    if(this.model.id)
      return;
    this.amountPercent = 0;
    let amount;
    if(e.type === 'paste') {
      amount = window.electron.clipboard.readText();
    } else {
      amount = e.target.value;
    }
    amount = delocalize(amount);
    amount = amount === '.' ? '0.' : amount;
    const [ valid, skipPopper = false ] = this.validAmount(amount);
    if(!valid) {
      const fixed = this.fixAmount(amount);
      if(!skipPopper) this.showPopper('minAmount', Localize.text('You can only specify amounts with at most 6 decimal places.', 'orderform'), 5000);
      e.target.value = relocalize(fixed);
    } else if(e.type === 'paste') {
      e.target.value = relocalize(amount);
    }
  }

  priceChanged(e) {
    e.preventDefault();
    if(this.model.id)
      return;
    const decimalSeparator = Localize.decimalSeparator();
    const type = this.tabView.activeIndex === 0 ? 'buy' : 'sell';
    this.model.id = '';
    let price;
    if(e.type === 'paste') {
      price = window.electron.clipboard.readText();
    } else {
      price = e.target.value;
    }
    price = delocalize(price);
    price = price === '.' ? '0.' : price;
    const { amount = '', totalPrice = '' } = this.model;
    const [ valid, skipPopper = false ] = this.validAmount(price);
    let fixed;
    if(!valid) {
      fixed = this.fixAmount(price);
      if(!skipPopper) this.showPopper('price', Localize.text('You can only specify amounts with at most 6 decimal places.', 'orderform'), 5000);
      e.target.value = relocalize(fixed);
    } else if(e.type === 'paste') {
      e.target.value = relocalize(price);
    }
    const numeric = new Set(['0','1','2','3','4','5','6','7','8','9','.','Decimal','Backspace', decimalSeparator]);
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
    if(this.model.id)
      return;
    const decimalSeparator = Localize.decimalSeparator();
    const type = this.tabView.activeIndex === 0 ? 'buy' : 'sell';
    this.model.id = '';
    let secondPrice;
    if(e.type === 'paste') {
      secondPrice = window.electron.clipboard.readText();
    } else {
      secondPrice = e.target.value;
    }
    secondPrice = delocalize(secondPrice);
    secondPrice = secondPrice === '.' ? '0.' : secondPrice;
    const { amount = '', totalPrice = '' } = this.model;
    const [ valid, skipPopper = false ] = this.validAmount(secondPrice);
    let fixed;
    if(!valid) {
      fixed = this.fixAmount(secondPrice);
      if(!skipPopper) this.showPopper('secondPrice', Localize.text('You can only specify amounts with at most 6 decimal places.', 'orderform'), 5000);
      e.target.value = relocalize(fixed);
    } else if(e.type === 'paste') {
      e.target.value = relocalize(secondPrice);
    }
    const numeric = new Set(['0','1','2','3','4','5','6','7','8','9','.','Decimal','Backspace', decimalSeparator]);
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
    let { value } = e.target;
    value = delocalize(value);
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

  resetModel(retainPrice = false) {
    this.model = {
      id: '',
      amount: '',
      price: retainPrice ? this.model.price : '',
      secondPrice: retainPrice ? this.model.secondPrice : '',
      totalPrice: '',
      makerAddress: this.addresses[this.symbols[0]] || '',
      takerAddress: this.addresses[this.symbols[1]] || '',
      minAmount: '',
      orderType: this.partialOrderType,
      repost: isBoolean(this.model.respost) ? this.model.repost : true,
    };
    this.formatNumberSymbol0 = this.formatNumber('0', this.symbols[0]);
    this.formatNumberSymbol1 = this.formatNumber('0', this.symbols[1]);
    this.amountPercent = 0;
  }

  validateNumber(numStr = '') {
    numStr = numStr.trim();
    return /\d+/.test(numStr) && /^\d*\.?\d*$/.test(numStr) && Number(numStr) > 0;
  }

  async onOrderSubmit(id = '', amount = '', totalPrice = '', type = '') {

    let { makerAddress = '', takerAddress = '' } = this.model;
    const { orderType, repost = false } = this.model;

    const orderformOrder = id ? false : true;

    let isPartialOrder, minimumAmount;

    if(orderformOrder) {
      id = this.model.id || id;
      amount = this.model.amount || amount;
      totalPrice = this.model.totalPrice || totalPrice;
      minimumAmount = this.model.minAmount || '0';
      isPartialOrder = orderType === this.partialOrderType;
    } else {
      isPartialOrder = false;
      minimumAmount = '0';
    }

    if(!amount) {
      alert(Localize.text('Oops! You must enter an amount.', 'orderform'));
      return;
    } else if(isPartialOrder && !minimumAmount) {
      // ToDo minimum amount validation
    } else if(!totalPrice) {
      alert(Localize.text('Oops! You must enter a price.', 'orderform'));
      return;
    } else if(!makerAddress) {
      alert(Localize.text('Oops! You must enter a {token} address.', 'orderform', {token: this.symbols[0]}));
      return;
    } else if(!takerAddress) {
      alert(Localize.text('Oops! You must enter a {token} address.', 'orderform', {token: this.symbols[1]}));
      return;
    } else if(makerAddress === takerAddress) {
      alert(Localize.text('Oops! You have the same address entered for both {token0} and {token1}.', 'orderform', {token0: this.symbols[0], token1: this.symbols[1]}));
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
    logger.info(`Submit ${type} order\n${JSON.stringify(this.model, null, '  ')}`);
    makerAddress = makerAddress.trim();
    takerAddress = takerAddress.trim();
    amount = amount.trim();
    totalPrice = totalPrice.trim();
    minimumAmount = minimumAmount.trim();

    if(
      !makerAddress ||
      !takerAddress ||
      !amount ||
      !this.validateNumber(amount) ||
      !totalPrice ||
      !this.validateNumber(totalPrice) ||
      (isPartialOrder && !this.validateNumber(minimumAmount))
    ) return;

    this.updateStoredAddresses(makerAddress, takerAddress);

    ipcRenderer.once('orderDone', (e, state) => {
      if(state === 'success') {
        ipcRenderer.send('saveAddress', this.symbols[0], makerAddress);
        ipcRenderer.send('saveAddress', this.symbols[1], takerAddress);
        if(orderformOrder) this.resetModel(true);
      } else if (state === 'failed') {
        alert('There was a problem with your order.');
      }
    });

    if(id) { // take order
      const origOrder = await ipcRenderer.invoke('getOrder', id);
      let params;
      if(type === 'buy') {
        params = {
          id,
          sendAddress: takerAddress,
          receiveAddress: makerAddress
        };
        if(Number(origOrder.partialMinimum) > 0) {
          params = {
            ...params,
            amount
          };
        }
      } else if(type === 'sell') {
        params = {
          id,
          sendAddress: makerAddress,
          receiveAddress: takerAddress
        };
        if(Number(origOrder.partialMinimum) > 0) {
          params = {
            ...params,
            amount: minAmountToPrice(origOrder.takerSize, amount, origOrder.makerSize).toFixed(6)
          };
        }
      }
      ipcRenderer.send('takeOrder', params);
    } else { // make order
      const endpoint = isPartialOrder ? 'makePartialOrder' : 'makeOrder';
      let params;
      if(type === 'buy') {
        params = {
          maker: this.symbols[1],
          makerSize: totalPrice,
          makerAddress: takerAddress,
          taker: this.symbols[0],
          takerSize: amount,
          takerAddress: makerAddress,
        };
        if(isPartialOrder) { // good
          params = {
            ...params,
            minimumSize: minAmountToPrice(amount, minimumAmount, totalPrice).toFixed(6),
            repost,
          };
        }
      } else if(type === 'sell') {
        params = {
          maker: this.symbols[0],
          makerSize: amount,
          makerAddress: makerAddress,
          taker: this.symbols[1],
          takerSize: totalPrice,
          takerAddress: takerAddress,
        };
        if(isPartialOrder) {
          params = {
            ...params,
            minimumSize: this.model.minAmount,
            repost,
          };
        }
      }
      ipcRenderer.send(endpoint, params);
    }
  }

  // minAmountToPrice(amount, minAmount, totalPrice) {
  //   // (minAmount * totalPrice) / amount
  //   amount = bignumber(amount);
  //   minAmount = bignumber(minAmount);
  //   totalPrice = bignumber(totalPrice);
  //   return math.divide(math.multiply(minAmount, totalPrice), amount).toNumber();
  // }

  onTabChange() {
    this.model.orderType = this.partialOrderType;
    this.model.id = '';
    this.amountPercent = 0;
  }

  openConfigurationWindow() {
    window.electron.ipcRenderer.send('openConfigurationWizard');
  }

  generateNewAddress(token) {
    window.electron.ipcRenderer.send('generateNewAddress', token);
  }

  toNumber(numStr) {
    if(!numStr) {
      return 0;
    } else {
      return Number(numStr);
    }
  }

  onSliderChange(newMinAmount) {
    this.zone.run(() => {
      this.model.minAmount = this.formatNumber(String(newMinAmount), 'BTC');
    });
  }

  getMinTooltipTitle(type) {
    if(this.model && this.model.id) { // taking order
      if(type === 'buy') {
        return this.Localize.text('This is the minimum that you can buy from this order', 'orderform');
      } else if(type === 'sell') {
        return this.Localize.text('This is the minimum that you can sell from this order', 'orderform');
      }
    } else { // making order
      if(type === 'buy') {
        return this.Localize.text('This is the minimum that a user can sell from your full order amount (defaults to 10%)', 'orderform');
      } else if(type === 'sell') {
        return this.Localize.text('This is the minimum that a user can buy from your full order amount (defaults to 10%)', 'orderform');
      }
    }
    return '';
  }

}
