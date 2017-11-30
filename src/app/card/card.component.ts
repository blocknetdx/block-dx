import { Component, OnInit, Input, ViewEncapsulation, ElementRef, ViewChild } from '@angular/core';

@Component({
  selector: 'bn-card',
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['./card.component.scss'],
  template: `
    <div #card class="bn-card {{cardClass}}">
      <div class="bn-card__title {{cardTitleClass}}">
        <ng-content select="bn-card-title"></ng-content>
        <a class="fullscreen" *ngIf="allowFullscreen"
          (click)="goFullscreen()">
          <i class="material-icons">zoom_out_map</i>
        </a>
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
  @Input() allowFullscreen: boolean = true;

  @ViewChild('card') public card: ElementRef;

  constructor() { }

  ngOnInit() {
  }

  goFullscreen() {
    if (!this.allowFullscreen) return;

    if (this.card.nativeElement.requestFullscreen) {
      this.card.nativeElement.requestFullscreen();
    } else if (this.card.nativeElement.msRequestFullscreen) {
      this.card.nativeElement.msRequestFullscreen();
    } else if (this.card.nativeElement.mozRequestFullScreen) {
      this.card.nativeElement.mozRequestFullScreen();
    } else if (this.card.nativeElement.webkitRequestFullscreen) {
      this.card.nativeElement.webkitRequestFullscreen();
    }
  }

}
