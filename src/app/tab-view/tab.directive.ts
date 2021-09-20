import { Directive, Input, ContentChild, TemplateRef, ElementRef } from '@angular/core';

@Directive({
  selector: 'bn-tab'
})
export class TabDirective {
  @ContentChild('content', {read: TemplateRef, static: false})
  content: TemplateRef<any>;

  @Input() public label: string;
  @Input() public barColor: string;
  @Input() public contentInHeader = false;
  @Input() public float = '';
  @Input() public hideLine = false;
  @Input() public showOnIndex = -1;

  constructor() {}
}
