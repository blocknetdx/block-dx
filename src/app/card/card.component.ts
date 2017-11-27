import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'bn-card',
  styleUrls: ['./card.component.scss'],
  template: `
    <div class="bn-card">
      <div class="bn-card__title">
        <ng-content select="bn-card-title"></ng-content>
      </div>
      <div class="bn-card__body">
        <ng-content select="bn-card-body"></ng-content>
      </div>
    </div>
  `
})
export class CardComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
