import { Directive, Input, ContentChild, TemplateRef } from '@angular/core';

@Directive({
  selector: 'bn-tab'
})
export class TabDirective {
  @ContentChild('content', {read: TemplateRef})
  content: TemplateRef<any>;

  @Input() public label: string;

  constructor() { }
}
