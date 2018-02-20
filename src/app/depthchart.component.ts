import { Component, OnInit, NgZone } from '@angular/core';
import { OrderbookService } from './orderbook.service';

@Component({
  selector: 'app-depthchart',
  templateUrl: './depthchart.component.html',
  styles: [`
    /*#chartdiv {*/
      /*width: 100%;*/
      /*height: 300px;*/
    /*}*/
  `]
  // styleUrls: ['./depthchart.component.scss']
})
export class DepthchartComponent {
  title = 'Depth Chart';

}
