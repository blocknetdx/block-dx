import { Component, NgZone, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import * as moment from 'moment';

import {CurrentpriceService} from './currentprice.service';
import {Localize} from './localize/localize.component';

declare var AmCharts;
declare var TradingView;
declare var Datafeeds;

@Component({
  selector: 'app-pricechart',
  templateUrl: './pricechart.component.html',
  styleUrls: ['./pricechart.component.scss']
})
export class PricechartComponent implements AfterViewInit, OnDestroy {
  @ViewChild('container', {static: false})
  public container: ElementRef;
  public granularity = 2; // 1: minute, 2: 15 minutes, 3: 30 minutes
  public model = { 1: [], 2: [], 3: [] };
  public dataReady = false;

  private chart: any;
  private pairUpdated = true;
  private subscriptions = [];
  private zoomedOut = true;

  public Localize = Localize;

  constructor(
    private currentpriceService: CurrentpriceService,
    private zone: NgZone
  ) {}

  ngAfterViewInit() {
    // Without a setTimeout we get an "ExpressionChangedAfterItHasBeenCheckedError" warning
    setTimeout(() => {

      this.makeChart();

      const { model, granularity, zone } = this;

      const prepData = arr => arr
        .map(i => Object.assign({}, i, {
          date: moment(i.time).toDate(),
          formattedTime: moment(i.time).format('LT'),
          low: i.low === 0 ? null : i.low,
          high: i.high === 0 ? null : i.high,
          open: i.open === 0 ? null : i.open,
          close: i.close === 0 ? null : i.close,
        }));

      this.subscriptions.push(this.currentpriceService.getOrderHistoryByMinute()
        .subscribe(items => {
          zone.run(() => {
            model['1'] = prepData(items);
          });
          if (granularity === 1) {
            this.dataReady = true;
            this.updatePriceChart();
          }
        })
      );

      this.subscriptions.push(this.currentpriceService.getOrderHistoryBy15Minutes()
        .subscribe(items => {
          zone.run(() => {
            model['2'] = prepData(items);
            if (granularity === 2) {
              this.dataReady = true;
              this.updatePriceChart();
            }
          });
        })
      );

      this.subscriptions.push(this.currentpriceService.getOrderHistoryBy1Hour()
        .subscribe(items => {
          zone.run(() => {
            model['3'] = prepData(items);
          });
          if (granularity === 3) {
            this.dataReady = true;
            this.updatePriceChart();
          }
        })
      );

      this.subscriptions.push(this.currentpriceService.onPair()
        .subscribe(pair => {
          this.pairUpdated = true;
        })
      );

    }, 0);
  }

  updatePriceChart() {
    const items = this.model[this.granularity];
    // Workaround for zooming chart out after switching trading pairs
    if (this.pairUpdated || this.zoomedOut)
      this.chart.zoomOutOnDataUpdate = true;
    this.chart.dataProvider = items;
    this.chart.validateData();
    this.chart.zoomOutOnDataUpdate = false;
    this.pairUpdated = false;
  }

  ngOnDestroy() {
    this.subscriptions
      .forEach(subscription => subscription.unsubscribe());
  }

  makeChart() {
    if (this.chart)
      this.chart.clear();

    this.chart = AmCharts.makeChart(this.container.nativeElement, {
      language: Localize.locale(),
      numberFormatter: {
        decimalSeparator: Localize.decimalSeparator(),
        thousandsSeparator: Localize.groupingSeparator()
      },
      'type': 'serial',
      'theme': 'dark',
      'legend': {
        'autoMargins': false,       //default true, If true, margins of the legend are adjusted and made equal to chart's margins.
        'fontSize': 11,             //default 11
        'horizontalGap': 0,         //default 0, Horizontal space between legend item and left/right border.
        'marginBottom': 20,         //default 0, Bottom margin.
        'marginLeft': 20,           //default 20, Left margin. This property will be ignored if autoMargins property of the legend is true.
        'marginRight': 20,          //default 20, Right margin. This property will be ignored if autoMargins property of the legend is true.
        'markerType': 'none',       //default square, Shape of the legend marker (key). Possible values are: square, circle, diamond, triangleUp, triangleDown, triangleLeft, triangleDown, bubble, line, none.
        //'maxColumns': 1,          //Maximum number of columns in the legend. If Legend's position is set to 'right' or 'left', maxColumns is automatically set to 1.
        'periodValueText': '[[value.open]]',
        'position': 'bottom',       //default bottom, Legend position. Possible values are: 'bottom', 'top', 'left', 'right' and 'absolute'.
        // 'rollOverColor': '4bf5c5',
        'spacing': 1,               //default 10, Horizontal space between legend items, in pixels.
        'switchable': false,        //default true, Whether showing/hiding of graphs by clicking on the legend marker is enabled or not.
        'textClickEnabled': false,  //default false, If true, clicking on the text will show/hide balloon of the graph. Otherwise it will show/hide graph/slice.
        'useGraphSettings': true,   //default false, Legend markers can mirror graph’s settings, displaying a line and bullet within the graph.
        'valueAlign': 'left',       //default right, Alignment of the value text. Possible values are 'left' and 'right'.
        'valueText': '[[value]]',
        'valueWidth': 50,           //default 50, Width of the value text.
        'verticalGap': 0            //default 10, Vertical space between legend items also between legend border and first and last legend row.
      },

      zoomOutOnDataUpdate: false,

      mouseWheelScrollEnabled: false,
      mouseWheelZoomEnabled: false,
      parseDates: true,
      'graphs': [ {
        'id': 'g1',
        // 'balloonText': 'Open:<b>[[open]]</b><br>Volume:<b>[[volume]]</b><br>Low:<b>[[low]]</b><br>High:<b>[[high]]</b><br>Close:<b>[[close]]</b><br>Time:<b>[[formattedTime]]</b><br>',
        'closeField': 'close',
        // 'legendValueText': '[[volume]] volume',
        // 'legendPeriodValueText': 'total: [[volume]]',
        'fillColors': '#00F4C5',
        'highField': 'high',
        'lineColor': '#00F4C5',
        'lineAlpha': 1,
        'lowField': 'low',
        'fillAlphas': 1,
        'negativeFillColors': '#FF7F71',
        'negativeLineColor': '#FF7F71',
        'openField': 'open',
        'type': 'candlestick',
        'title': Localize.text('Price', 'pricechart') + ':',
        'precision': 6,
        'connect': true,
        'columnWidth': 7,
        'showBalloon': false,
        'markerType': 'none',
        'proCandlesticks': true,
        'valueField': 'close'
      }, {
        'type': 'column',
        'title': Localize.text('High', 'pricechart') + ':',
        'precision': 6,
        'columnWidth': 0,
        'valueField': 'high',
        'openField': 'high',
        'lineThickness': 0,
        'showBalloon': false,
        'markerType': 'none',
        'clustered': false
      }, {
        'type': 'column',
        'title': Localize.text('Open', 'pricechart') + ':',
        'precision': 6,
        'columnWidth': 0,
        'valueField': 'open',
        'openField': 'open',
        'lineThickness': 0,
        'showBalloon': false,
        'markerType': 'none',
        'clustered': false
      }, {
        'type': 'column',
        'title': Localize.text('Close', 'pricechart') + ':',
        'precision': 6,
        'columnWidth': 0,
        'valueField': 'close',
        'openField': 'close',
        'lineThickness': 0,
        'showBalloon': false,
        'markerType': 'none',
        'clustered': false
      }, {
        'type': 'column',
        'title': Localize.text('Low', 'pricechart') + ':',
        'precision': 6,
        'columnWidth': 0,
        'valueField': 'low',
        'openField': 'low',
        'showBalloon': false,
        'lineThickness': 0,
        'markerType': 'none',
        'clustered': false
      }, {
        'id': 'g2',
        'valueAxis': 'v2',
        'bullet': 'round',
        'markerType': 'none',
        'bulletBorderAlpha': 0,
        'bulletColor': '#FFFFFF',
        'bulletSize': 0,
        'hideBulletsCount': 1,
        'columnWidth': 7,
        'lineColor': '#66666f',
        'type': 'column',
        'title': Localize.text('Volume', 'pricechart') + ':',
        'precision': 0,
        'useLineColorForBulletBorder': true,
        'valueField': 'volume',
        'fillAlphas': 0.05,
        'clustered': false,
        'showBalloon': false
        // 'balloonText': '[[title]]<br /><b style='font-size: 130%'>[[value]]</b>'
      } ],
      'valueAxes': [{
        'title': Localize.text('Price', 'pricechart') + ':',
        'precision': 3,
        'labelOffset': 0,
        'boldLabels': false,
        'lineThickness': 1,
        'strictMinMax': false,
        'reversed': false,
        'axisAlpha': 1,
        'position': 'left',
        'integersOnly': false,
        'guides': [{
          'value': 1,
          'label': '1'
        }]}, {
        'id': 'v2',
        'title': Localize.text('Volume', 'pricechart') + ':',
        'precision': 0,
        'boldLabels': false,
        'labelOffset': 0,
        'gridAlpha': 0,
        'position': 'right',
        'axisAlpha': 1,
        'minimum': 0,
        'minMaxMultiplier': 10,
        'autoGridCount': false
      }],
      // 'chartScrollbar': {
      //   // dragIcon: 'dragIconRoundSmallBlack',
      //   'graph': 'g1',
      //   'graphType': 'line',
      //   'scrollbarHeight': 30,
      //   graphFillAlpha: .1,
      //   selectedGraphFillAlpha: .1
      // },
      'chartCursor': {
        'valueLineEnabled': true,
        'categoryBalloonDateFormat': 'MMM DD JJ:NN',
        'cursorPosition': 'mouse',
        'valueLineBalloonEnabled': true
      },
      'categoryField': 'date',
      'categoryAxis': {
        dateFormats: [
          {'period':'fff','format':'JJ:NN:SS'},
          {'period':'ss','format':'JJ:NN:SS'},
          {'period':'mm','format':'JJ:NN'},
          {'period':'hh','format':'JJ:NN'},
          {'period':'DD','format':'MMM DD'},
          {'period':'WW','format':'MMM DD'},
          {'period':'MM','format':'MMM'},
          {'period':'YYYY','format':'YYYY'}],
        parseDates: true,
        minPeriod: 'mm'
      },
      'export': {
        'enabled': false,
        'position': 'bottom-right'
      }
    });

    this.chart.addListener('zoomed', e => {
      const { start, end, start0, end0 } = e.chart;
      if((!start0 && start0 !== 0) || (!end0 && end0 !== 0) || (start === start0 && end === end0)) {
        this.zoomedOut = true;
      } else {
        this.zoomedOut = false;
      }
    });
  }

}
