import { Component, OnInit, ViewEncapsulation } from '@angular/core';

import { fadeInOut } from '../animations';

@Component({
  selector: 'app-pair-selector',
  templateUrl: './pair-selector.component.html',
  styleUrls: ['./pair-selector.component.scss'],
  animations: [fadeInOut]
})
export class PairSelectorComponent implements OnInit {

  symbols: string[] = ['ETH', 'BTC'];
  active: boolean;

  rows: any[] = [
    
  ]

  constructor() { }

  ngOnInit() {
  }

}
