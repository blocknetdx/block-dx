import { OnDestroy } from '@angular/core';
import { Subject } from 'rxjs/Subject';

export abstract class BaseComponent implements OnDestroy {
  protected $destroy: Subject<boolean>;

  constructor() {
    this.$destroy = new Subject();
  }

  ngOnDestroy() {
    // console.log('destroy:', this.constructor.name);
    this.$destroy.next(true);
    this.$destroy.unsubscribe();
    this.$destroy = null;
  }

}
