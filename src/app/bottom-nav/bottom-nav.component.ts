import {
  AfterContentInit,
  Component,
  ContentChildren,
  Directive,
  EventEmitter,
  Output,
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

  @Output('onNavIndexUpdate')
  public navIndexUpdate: EventEmitter<number> = new EventEmitter();

  private destroy$: Subject<boolean> = new Subject<boolean>();
  public activeIndex: number = 0;

  constructor() { }

  ngAfterContentInit() {
    this.navItems.forEach((item) => {
      item.activeEmitter
        .takeUntil(this.destroy$)
        .subscribe((activeItem) => {
          this.setActiveNavItem(activeItem);
        });
    });
    this.setActiveNavItem(this.navItems.first);
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  setActiveNavItem(activeItem) {
    this.navItems.forEach((item, idx) => {
      item.active = item === activeItem;
      if (item.active) {
        this.navIndexUpdate.emit(idx);
      }
    });
  }

}
