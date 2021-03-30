import {Component, OnInit, OnDestroy, NgZone, ViewChild, ElementRef, Input} from '@angular/core';
import * as $ from 'jquery';

@Component({
  selector: 'app-slider-input',
  templateUrl: './slider-input.component.html',
  styleUrls: ['./slider-input.component.scss'],
})
export class SliderInputComponent implements OnInit, OnDestroy {

  @Input() set minAmount(minAmount) {
    this._minAmount = minAmount;
    this.percent = this.calculatePercentFromValue(this.value);
  }
  get minAmount() {
    return this._minAmount;
  }
  @Input() set maxAmount(maxAmount) {
    this._maxAmount = maxAmount;
    this.percent = this.calculatePercentFromValue(this.value);
  }
  get maxAmount() {
    return this._maxAmount;
  }
  @Input() set value(value) {
    this._value = value;
    this.percent = this.calculatePercentFromValue(value);
    // console.log('set value', value, this.percent);
  }
  get value() {
    return this._value;
  }

  @Input() public onChange: Function;

  @ViewChild('sliderBar', {static: false})
  public sliderBar: ElementRef;

  public _value = 0;
  public _maxAmount = 0;
  public _minAmount = 0;
  public percent = 0;
  public dragging = false;
  public mousedown = false;
  public startLeft: number;
  public startRight: number;

  constructor(
    private zone: NgZone
  ) {

  }

  ngOnInit() {
    this.onWindowMouseUp = this.onWindowMouseUp.bind(this);
    this.onWindowMouseMove = this.onWindowMouseMove.bind(this);
    $(window).on('mouseup', this.onWindowMouseUp);
    $(window).on('mousemove', this.onWindowMouseMove);
  }

  ngOnDestroy() {
    $(window).off('mouseup', this.onWindowMouseUp);
    $(window).off('mousemove', this.onWindowMouseMove);
  }

  onWindowMouseUp(e) {
    if(this.mousedown || this.dragging) {
      e.preventDefault();
      this.zone.run(() => {
        const { clientX } = e;
        const percent = this.calculateValueFromClientX(clientX);
        this.onChange(this.calculateChangeValueFromPercent(percent));
        this.mousedown = false;
        this.dragging = false;
      });
    }
  }

  onWindowMouseMove(e) {
    if(this.mousedown) {
      e.preventDefault();
      this.zone.run(() => {
        if(!this.dragging)
          this.dragging = true;
        const { clientX } = e;
        const percent = this.calculateValueFromClientX(clientX);
        this.onChange(this.calculateChangeValueFromPercent(percent));
      });
    }
  }

  onBarMouseDown(e) {
    e.preventDefault();
    if(document.activeElement && document.activeElement instanceof HTMLElement)
      document.activeElement.blur();
    setTimeout(() => {
      this.mousedown = true;
    }, 0);
  }

  calculateValueFromClientX(clientX: number) {
    const sliderBar = this.sliderBar.nativeElement;
    const { left, right, width } = sliderBar.getBoundingClientRect();
    if(clientX < left) {
      return 0;
    } else if(clientX > right) {
      return 100;
    } else {
      return parseInt(String(((clientX - left) / width) * 100), 10);
    }
  }

  calculateChangeValueFromPercent(percent): number {
    if(percent === 100) {
      return this.maxAmount;
    } else if(percent === 0) {
      return this.minAmount;
    } else {
      return this.minAmount + (percent / 100) * (this.maxAmount - this.minAmount);
    }
  }

  calculatePercentFromValue(value = 0): number {
    const maxDiff = this.maxAmount - this.minAmount;
    const valueDiff = value - this.minAmount;
    if(valueDiff <= 0 || maxDiff <= 0) {
      return 0;
    } else if(valueDiff >= maxDiff) {
      return 100;
    }
    const percent = (valueDiff / maxDiff) * 100;
    return parseInt(percent.toFixed(0), 10);
  }

}
