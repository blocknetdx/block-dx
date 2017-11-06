import {
  AfterContentInit,
  Component,
  ContentChildren,
  Input,
  QueryList
} from '@angular/core';

import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/takeUntil';

import { NavButtonComponent } from '../nav-button/nav-button.component';

@Component({
  selector: 'app-bottom-nav',
  templateUrl: './bottom-nav.component.html',
  styleUrls: ['./bottom-nav.component.scss']
})
export class BottomNavComponent implements AfterContentInit {
  @ContentChildren(NavButtonComponent)
  public navItems: QueryList<NavButtonComponent>;

  @Input()
  public activeIndex: number = 0;

  private destroy$: Subject<boolean> = new Subject<boolean>();

  constructor() { }

  ngAfterContentInit() {
    this.navItems.forEach((item) => {
      item.activeEmitter
        .takeUntil(this.destroy$)
        .subscribe((activeItem) => {
          this.setActiveNavItem(activeItem);
        });
    });
    this.setActiveNavItem(this.navItems.find((itm, idx) => idx === this.activeIndex));
  }

  ngOnDestroy() {
    this.navItems.forEach((item) => {
      item.active = true;
    });
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  setActiveNavItem(activeItem) {
    this.navItems.forEach((item, idx) => {
      item.active = item === activeItem;
    });
  }

}
