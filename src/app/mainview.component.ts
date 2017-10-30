import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Location }                 from '@angular/common';

@Component({
  selector: 'mainview',
  templateUrl: './mainview.component.html',
  styleUrls: ['./mainview.component.scss']
})
export class MainviewComponent {
  public symbols:string[];

  constructor(
    private route: ActivatedRoute,
    private location: Location
  ) {}

  ngOnInit(): void {
    var currID = this.route.params.subscribe(params => {
       var id = params['id'];
       if(id) {
         this.symbols = id.split("-");
       } else {
         this.symbols = ["ETH","BTC"]
       }
    });
  }
}
