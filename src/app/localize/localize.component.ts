// tslint:disable:component-selector
// tslint:disable:component-class-suffix

import {Component, ContentChild, Input} from '@angular/core';
import escapeRegExp from 'lodash/escapeRegExp';
import { Localize as LocalizeBack } from '../../../src-back/localize';
import '../../amcharts/lang/de';

@Component({
  selector: 'Localize',
  template: '{{val}}'
})
export class Localize {

  @Input() context: string;
  @Input() key: string;
  @Input() replacers: object;

  static initialize(locale: string, data: any, debug = false) {
    LocalizeBack.initialize(locale, data, debug);
  }

  static locale() {
    return LocalizeBack.locale();
  }

  static text(key, context, replacers = {}) {
    return LocalizeBack.text(key, context, replacers);
  }

  static number(num) {
    return LocalizeBack.number(num);
  }

  static compare(a, b) {
    return LocalizeBack.compare(a, b);
  }

  static decimalSeparator() {
    return LocalizeBack.decimalSeparator();
  }

  static groupingSeparator() {
    return LocalizeBack.groupingSeparator();
  }

  get val() {
    const { key, context, replacers } = this;
    return Localize.text(key, context, replacers);
  }

}
