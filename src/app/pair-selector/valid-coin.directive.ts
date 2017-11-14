import { Directive, Input } from '@angular/core';
import { NG_VALIDATORS, Validator, AbstractControl, ValidatorFn } from '@angular/forms';

@Directive({
  selector: '[validCoin]',
  providers: [
    {
      provide: NG_VALIDATORS,
      useExisting: ValidCoinDirective,
      multi: true
    }
  ]
})
export class ValidCoinDirective implements Validator {
  @Input() validCoin: any;

  private validator: ValidatorFn;

  constructor() {
    this.validator = coinValidator();
  }

  validate(control: AbstractControl): {[key: string]: any} {
    console.log(control, this.validCoin);
    // return this.forbiddenName ? forbiddenNameValidator(new RegExp(this.forbiddenName, 'i'))(control) : null;
    return this.validator(control);
  }

}

function coinValidator(): ValidatorFn {
  return (c: AbstractControl) => {
    let isValid = false;

    if (isValid) {
      return null;
    } else {
      return {
        coin: {
          valid: false
        }
      }
    }
  }
}
