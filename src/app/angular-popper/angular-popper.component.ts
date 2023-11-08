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
  import { createPopper, Instance, Placement } from '@popperjs/core';

  @Component({
    selector: 'angular-popper',
    templateUrl: './angular-popper.component.html',
    styleUrls: ['./angular-popper.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
  })
  export class PopperComponent implements AfterViewInit, OnChanges, OnDestroy {
    @Input() show = false;
    @Input() closeButton = true;
    @Input() placement: Placement = 'bottom'; // Specify the type as Placement
    @Input() target: string | Element;
  
    @Output() close = new EventEmitter();
  
    private popper: Instance | null = null;
  
    constructor(private el: ElementRef, private zone: NgZone) {}
  
    ngAfterViewInit() {
      this.create();
    }
  
    ngOnChanges(changes: SimpleChanges) {
      if (
        (changes.target && !changes.target.firstChange) ||
        (changes.placement && !changes.placement.firstChange)
      ) {
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
        const target = this.getTargetNode();
        const popperElement = this.el.nativeElement.querySelector('.angular-popper');
        if (target && popperElement) {
          this.popper = createPopper(target, popperElement, {
            placement: this.placement,
            // modifiers: {
            //   // Add any Popper modifiers you need
            // },
          });
        }
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
  
    private getTargetNode(): Element | null {
      if (this.target) {
        if (typeof this.target === 'string') {
          return document.querySelector(this.target);
        } else if (this.target instanceof Element) {
          return this.target;
        }
      }
      return null; // Return null if no target is specified
    }
  }
