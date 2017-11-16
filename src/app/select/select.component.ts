import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'bn-select',
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

  @Input()
  public options: {value: any, viewValue: string}[];

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

  constructor() { }

  ngOnInit() {
  }

}
