import { Component, OnInit, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-pair-selector',
  templateUrl: './pair-selector.component.html',
  styleUrls: ['./pair-selector.component.scss']
})
export class PairSelectorComponent implements OnInit {

  symbols: string[] = ['ETH', 'BTC'];
  active: boolean;

  constructor() { }

  ngOnInit() {
  }

}
