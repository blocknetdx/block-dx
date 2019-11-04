import { Directive, Input, ContentChild, TemplateRef, ElementRef } from '@angular/core';

@Directive({
  selector: 'bn-tab'
})
export class TabDirective {
  @ContentChild('content', {read: TemplateRef})
  content: TemplateRef<any>;

  @Input() public label: string;
  @Input() public barColor: string;
  @Input() public contentInHeader = false;

  constructor() {}
}
