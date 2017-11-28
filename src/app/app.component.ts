import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  constructor() {
    if ('ontouchstart' in document.documentElement) {
      document.querySelector('html').classList.add('touch');
    }
  }
}
