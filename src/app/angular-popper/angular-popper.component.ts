import {
  Component,
  Input,
  Output,
  EventEmitter,
  AfterViewInit,
  OnDestroy,
  OnChanges,
  ElementRef,
  SimpleChanges,
  ChangeDetectionStrategy,
  NgZone } from '@angular/core';
import Popper from 'popper.js';

@Component({
  selector: 'angular-popper',
  templateUrl: './angular-popper.component.html',
  styleUrls: ['./angular-popper.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PopperComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input() show = false;
  @Input() closeButton = true;
  @Input() placement: Popper.Placement = 'bottom';
  @Input() target: string | Element;

  @Output() close = new EventEmitter();

  private popper: Popper;

  constructor(private el: ElementRef, private zone: NgZone) {}

  ngAfterViewInit() {
    this.create();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.target && !changes.target.firstChange ||
      changes.placement && !changes.placement.firstChange) {
      this.destroy();
      this.create();
    }
  }

  ngOnDestroy() {
    this.destroy();
  }

  onClose() {
    this.show = false;
    this.close.emit();
  }

  create() {
    this.zone.runOutsideAngular(() => {
      this.popper = new Popper(
        this.getTargetNode(),
        this.el.nativeElement.querySelector('.angular-popper'),
        {
          placement: this.placement,
          modifiers: {
            // flip: {
            //   enabled: false
            // }
          }
        });
    });
  }

  destroy() {
    if (this.popper) {
      this.zone.runOutsideAngular(() => {
        this.popper.destroy();
      });

      this.popper = null;
    }
  }

  private getTargetNode(): Element {
    if (this.target) {
      if (typeof this.target === 'string') {
        return document.querySelector(this.target);
      } else {
        return this.target;
      }
    } else {
      return this.el.nativeElement;
    }
  }
}
