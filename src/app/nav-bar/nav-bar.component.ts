import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-nav-bar',
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.scss']
})
export class NavBarComponent implements OnInit {
  @Input() public symbols: string[];

  public navCollapsed: boolean;

  constructor() { }

  ngOnInit() {
  }

  toggleNav() {
    this.navCollapsed = !this.navCollapsed;
  }

}
