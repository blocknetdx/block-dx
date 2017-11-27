import { Component, OnInit, Input, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'bn-card',
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['./card.component.scss'],
  template: `
    <div class="bn-card {{cardClass}}">
      <div class="bn-card__title {{cardTitleClass}}">
        <ng-content select="bn-card-title"></ng-content>
      </div>
      <div class="bn-card__body">
        <ng-content select="bn-card-body"></ng-content>
      </div>
    </div>
  `
})
export class CardComponent implements OnInit {
  @Input() cardClass: string;
  @Input() cardTitleClass: string;

  constructor() { }

  ngOnInit() {
  }

}
