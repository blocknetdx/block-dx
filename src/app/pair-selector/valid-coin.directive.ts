import { Directive, Input, forwardRef } from '@angular/core';
import { NG_ASYNC_VALIDATORS, Validator, AbstractControl, ValidatorFn, NgModel } from '@angular/forms';
import { Observable } from 'rxjs/Observable';

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';

import { CryptocurrencyService } from '../cryptocurrency.service';

@Directive({
  selector: '[validCoin][ngModel]',
  providers: [
    {
      provide: NG_ASYNC_VALIDATORS,
      useExisting: forwardRef(() => ValidCoinDirective),
      multi: true
    }
  ]
})
export class ValidCoinDirective implements Validator {
  private validator: ValidatorFn;

  constructor(
    private cryptoService: CryptocurrencyService
  ) {
    this.validator = coinValidator(this.cryptoService);
  }

  validate(control: AbstractControl) {
    return this.validator(control).debounceTime(500).distinctUntilChanged().first();
  }
}

function coinValidator(service: CryptocurrencyService): ValidatorFn {
  return (c: AbstractControl): Observable<any> => {
    return service.getCurrencies()
      .map((data) => {
        const valid = data.some((d) => d.toString() === c.value);
        return valid ? null : {
            coin: {
              valid: false
            }
          }
      });
  }
}
