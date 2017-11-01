import {
  AfterContentInit,
  Component,
  ContentChildren,
  Directive,
  QueryList
} from '@angular/core';

import { NavButtonComponent } from '../nav-button/nav-button.component';

@Component({
  selector: 'app-bottom-nav',
  templateUrl: './bottom-nav.component.html',
  styleUrls: ['./bottom-nav.component.scss']
})
export class BottomNavComponent implements AfterContentInit {
  @ContentChildren(NavButtonComponent) navItems: QueryList<NavButtonComponent>;

  constructor() { }

  ngAfterContentInit() {
    console.log(this.navItems);
  }

}
