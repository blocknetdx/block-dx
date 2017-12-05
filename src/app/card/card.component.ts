import { Component, OnInit, Input, ViewEncapsulation, ElementRef, ViewChild, Inject } from '@angular/core';

@Component({
  selector: 'bn-card',
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['./card.component.scss'],
  providers: [{provide: Document, useValue: document}],
  template: `
    <div #card class="bn-card {{cardClass}}">
      <div class="bn-card__title {{cardTitleClass}}">
        <ng-content select="bn-card-title"></ng-content>
        <a class="fullscreen" *ngIf="allowFullscreen"
          (click)="goFullscreen()">
          <i *ngIf="!isFullscreen" class="material-icons">zoom_out_map</i>
          <i *ngIf="isFullscreen" class="material-icons">fullscreen_exit</i>
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

  public isFullscreen: boolean;

  constructor(@Inject(Document) private document: Document) { }

  ngOnInit() {
    if (this.allowFullscreen && this.document.addEventListener) {
      this.document.addEventListener('webkitfullscreenchange', this.fullscreenHandler.bind(this), false);
      this.document.addEventListener('mozfullscreenchange', this.fullscreenHandler.bind(this), false);
      this.document.addEventListener('fullscreenchange', this.fullscreenHandler.bind(this), false);
      this.document.addEventListener('MSFullscreenChange', this.fullscreenHandler.bind(this), false);
    }
  }

  ngOnDestroy() {
    if (this.allowFullscreen && this.document.removeEventListener) {
      this.document.removeEventListener('webkitfullscreenchange', this.fullscreenHandler.bind(this), false);
      this.document.removeEventListener('mozfullscreenchange', this.fullscreenHandler.bind(this), false);
      this.document.removeEventListener('fullscreenchange', this.fullscreenHandler.bind(this), false);
      this.document.removeEventListener('MSFullscreenChange', this.fullscreenHandler.bind(this), false);
    }
  }

  fullscreenHandler(e) {
    if ((this.document.fullscreenElement && this.document.fullscreenElement !== null) ||
        (this.document.webkitFullscreenElement && this.document.webkitFullscreenElement !== null) ||
        (this.document['mozFullScreenElement'] && this.document['mozFullScreenElement'] !== null) ||
        (this.document['msFullscreenElement'] && this.document['msFullscreenElement'] !== null)) {
      this.isFullscreen = true;
    } else {
      this.isFullscreen = false;
    }
  }

  goFullscreen() {
    if (!this.allowFullscreen) return;

    if (!this.isFullscreen) {
      if (this.card.nativeElement.requestFullscreen) {
        this.card.nativeElement.requestFullscreen();
      } else if (this.card.nativeElement.msRequestFullscreen) {
        this.card.nativeElement.msRequestFullscreen();
      } else if (this.card.nativeElement.mozRequestFullScreen) {
        this.card.nativeElement.mozRequestFullScreen();
      } else if (this.card.nativeElement.webkitRequestFullscreen) {
        this.card.nativeElement.webkitRequestFullscreen();
      }
    } else {
      if (this.document.exitFullscreen) {
        this.document.exitFullscreen();
      } else if (this.document['webkitExitFullscreen']) {
        this.document['webkitExitFullscreen']();
      } else if (this.document['mozCancelFullScreen']) {
        this.document['mozCancelFullScreen']();
      } else if (this.document['msExitFullscreen']) {
        this.document['msExitFullscreen']();
      }
    }

    // this.isFullscreen = !this.isFullscreen;
  }

}
