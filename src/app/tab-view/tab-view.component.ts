import { Component, ContentChildren, QueryList, ViewChildren, ElementRef, ViewChild } from '@angular/core';

import { TabDirective } from './tab.directive';

@Component({
  selector: 'bn-tab-view',
  styleUrls: ['./tab-view.component.scss'],
  template: `
    <div #buttonContainer class="tabs">
      <a class="tab" #button *ngFor="let tab of tabs; let i = index"
        (click)="activeTab = tab"
        [class.active]="activeTab === tab">
        {{tab.label}}
      </a>
      <span [class.notransition]="!allowTransition" [ngStyle]="calculateBar()" class="bar"></span>
    </div>
    <div class="tab-view__body">
      <ng-container *ngFor="let tab of tabs; let i = index">
        <ng-container *ngIf="activeTab === tab">
          <ng-template *ngTemplateOutlet="tab.content"></ng-template>
        </ng-container>
      </ng-container>
    </div>
  `
})
export class TabViewComponent {
  @ViewChild('buttonContainer')
  public buttonContainer: ElementRef;

  @ViewChildren('button')
  public buttons: QueryList<ElementRef>;

  @ContentChildren(TabDirective)
  set tabTemplates(val: QueryList<TabDirective>) {
    this.tabs = val.toArray();
  }

  public tabs: TabDirective[];
  public contentInit: boolean;
  public allowTransition: boolean;

  private _activeTab: TabDirective;
  public get activeTab(): TabDirective { return this._activeTab; }
  public set activeTab(val: TabDirective) {
    this._activeTab = val;
  }

  constructor() { }

  ngAfterContentInit() {
    this.activeTab = this.tabs[0];
    setTimeout(() => {
      this.contentInit = true;
    });
  }

  calculateBar(): any {
    if (!this.tabs || !this.buttons || !this.contentInit) return null;
    if (!this.allowTransition) {
      setTimeout(() => this.allowTransition = true);
    }

    const idx = this.tabs.indexOf(this.activeTab);
    const rect = this.buttons.toArray()[idx].nativeElement.getBoundingClientRect();
    const parentRect = this.buttonContainer.nativeElement.getBoundingClientRect();

    return {
      'width': `${Math.ceil(rect.width)}px`,
      'left': `${Math.floor(rect.x-parentRect.x)}px`
    }
  }

}
