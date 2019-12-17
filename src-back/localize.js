const escapeRegExp = require('lodash/escapeRegExp');

let localeData;
const backupLocale = 'en';
let selectedLocale;
let debugging;
let collator;
let decimalSeparator;
let groupingSeparator;

class Localize {

  static initialize(locale, data, debug = false) {
    selectedLocale = locale;
    localeData = data;
    collator = new Intl.Collator(locale);
    debugging = debug;
    decimalSeparator = (1.2).toLocaleString([locale, backupLocale]).match(/\D/)[0];
    groupingSeparator = (1000000).toLocaleString([locale, backupLocale]).match(/\D/)[0];
  }

  static text(key, context, replacers = {}) {
    let text = localeData[key] && localeData[key][context] ? localeData[key][context].val : key;
    const replacerKeys = Object.keys(replacers);
    if(replacerKeys.length > 0) {
      for(const replacer of Object.keys(replacers)) {
        const val = replacers[replacer];
        const patt = new RegExp(escapeRegExp('{' + replacer + '}'), 'g');
        text = text.replace(patt, val);
      }
    }
    if(debugging) {
      return '***' + text + '***';
    } else {
      return text;
    }
  }

  static locale() {
    return selectedLocale;
  }

  static number(num) {
    return num.toLocaleString([selectedLocale, backupLocale]);
  }

  static compare(a, b) {
    return collator.compare(a, b);
  }

  static decimalSeparator() {
    return decimalSeparator;
  }

  static groupingSeparator() {
    return groupingSeparator;
  }

}

module.exports = {
  Localize
};
