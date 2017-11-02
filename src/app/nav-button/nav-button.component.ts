import { Component, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-nav-button',
  templateUrl: './nav-button.component.html',
  styleUrls: ['./nav-button.component.scss']
})
export class NavButtonComponent implements OnInit {
  @Output('onActive')
  public activeEmitter: EventEmitter<NavButtonComponent> = new EventEmitter();

  public active: boolean;

  constructor() { }

  ngOnInit() {
  }

  setActive() {
    this.activeEmitter.emit(this);
  }

}
