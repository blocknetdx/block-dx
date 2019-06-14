import { Component, Input, ViewEncapsulation, OnInit, NgZone } from '@angular/core';

@Component({
  selector: 'app-big-tooltip',
  templateUrl: './big-tooltip.component.html',
  styleUrls: ['./big-tooltip.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class BigTooltipComponent {

  @Input() title: string;
  @Input() show = false;

  constructor() {}

}
