import {
  Component, OnInit, Input, Output,
  EventEmitter, ElementRef
} from '@angular/core';

@Component({
  selector: 'bn-select',
  host: {
    '(document:click)': 'onClick($event)'
  },
  template: `
    <div class="select-wrapper" [class.active]="active" (click)="active = !active">
      <span class="placeholder" *ngIf="!selected">{{placeholder}}</span>
      <span class="selected-value" *ngIf="selected">{{selected.viewValue}}</span>
      <ul class="dropdown-list" *ngIf="active">
        <li class="dropdown-list__item"
          *ngFor="let option of options"
          (click)="selected = option">
          {{option.viewValue}}
        </li>
      </ul>
    </div>
  `,
  styleUrls: ['./select.component.scss']
})
export class SelectComponent implements OnInit {
  @Input()
  public placeholder: string = 'Choose one';

  private _options: {value: any, viewValue: string}[];
  public get options(): {value: any, viewValue: string}[] {
    return this._options;
  }
  @Input()
  public set options(val: {value: any, viewValue: string}[]) {
    this._options = val;
    this.selected = val[0];
  }

  @Output('onSelectChange')
  public selectChangeEmitter: EventEmitter<any> = new EventEmitter();

  public active: boolean;

  private _selected: {value: any, viewValue: string};
  public get selected(): {value: any, viewValue: string} {
    return this._selected;
  }
  public set selected(val: {value: any, viewValue: string}) {
    this._selected = val;
    this.selectChangeEmitter.emit(this._selected.value);
  }

  constructor(
    private el: ElementRef
  ) { }

  ngOnInit() {
  }

  onClick(e) {
    if (!this.el.nativeElement.contains(e.target)) {
      this.active = false;
    }
  }

}
