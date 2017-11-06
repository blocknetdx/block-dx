import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-nav-button',
  templateUrl: './nav-button.component.html',
  styleUrls: ['./nav-button.component.scss']
})
export class NavButtonComponent {
  @Input() public views: HTMLDivElement[];

  @Output('onActive')
  public activeEmitter: EventEmitter<NavButtonComponent> = new EventEmitter();

  private _active: boolean;
  public get active(): boolean { return this._active; }
  public set active(val: boolean) {
    this.views.forEach((view) => {
      view.style.display = val ? '' : 'none';
    });

    this._active = val;
  }

  constructor() { }

  setActive() {
    this.activeEmitter.emit(this);
  }

}
