import { Component, NgZone, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import * as moment from 'moment';

import {CurrentpriceService} from './currentprice.service';

declare var AmCharts;
declare var TradingView;
declare var Datafeeds;

@Component({
  selector: 'app-pricechart',
  templateUrl: './pricechart.component.html',
  styleUrls: ['./pricechart.component.scss']
})
export class PricechartComponent implements AfterViewInit {
  @ViewChild('container')
  public container: ElementRef;
  public granularity = 2; // 1: minute, 2: 15 minutes, 3: 30 minutes
  public model = { 1: [], 2: [], 3: [] };

  private chart: any;
  private pairUpdated = true;

  constructor(
    private currentpriceService: CurrentpriceService,
    private zone: NgZone
  ) {
    this.chart = AmCharts.makeChart( 'tv_chart_container', {
        'type': 'serial',
        'theme': 'dark',
        'legend': {
          'equalWidths': false,
          'useGraphSettings': true,
          'textClickEnabled': true,
          'valueAlign': 'left',
          'markerType': 'none',
          'valueWidth': 100,
          'valueText': '[[value]]',
          'periodValueText': '[[value.open]]'
        },
        zoomOutOnDataUpdate: false,
        mouseWheelScrollEnabled: false,
        mouseWheelZoomEnabled: false,
        parseDates: true,
        'graphs': [ {
          'id': 'g1',
          //'balloonText': 'Open:<b>[[open]]</b><br>Volume:<b>[[volume]]</b><br>Low:<b>[[low]]</b><br>High:<b>[[high]]</b><br>Close:<b>[[close]]</b><br>Time:<b>[[formattedTime]]</b><br>',
          'closeField': 'close',
          //'legendValueText': '[[volume]] volume',
          //'legendPeriodValueText': 'total: [[volume]]',
          'fillColors': '#4bf5c5',
          'highField': 'high',
          'lineColor': '#4bf5c5',
          'lineAlpha': 1,
          'lowField': 'low',
          'fillAlphas': 1,
          'negativeFillColors': '#ff7e71',
          'negativeLineColor': '#ff7e71',
          'openField': 'open',
          'title': 'Price:',
          'type': 'candlestick',
          'connect': true,
          'columnWidth': 7,
          'showBalloon': false,
          'markerType': 'none',
          'proCandlesticks': true,
          'valueField': 'close'
        }, {
          'type': 'column',
          'title': 'High:',
          'columnWidth': 0,
          'valueField': 'high',
          'openField': 'high',
          'lineThickness': 0,
          'showBalloon': false,
          'markerType': 'none',
          'clustered': false
        }, {
          'type': 'column',
          'title': 'Open:',
          'columnWidth': 0,
          'valueField': 'open',
          'openField': 'open',
          'lineThickness': 0,
          'showBalloon': false,
          'markerType': 'none',
          'clustered': false
        }, {
          'type': 'column',
          'title': 'Close:',
          'columnWidth': 0,
          'valueField': 'close',
          'openField': 'close',
          'lineThickness': 0,
          'showBalloon': false,
          'markerType': 'none',
          'clustered': false
        }, {
          'type': 'column',
          'columnWidth': 0,
          'title': 'Low:',
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
            'bulletBorderAlpha': 1,
            'bulletColor': '#FFFFFF',
            'bulletSize': 0,
            'hideBulletsCount': 1,
            'columnWidth': 7,
            'lineColor': '#20acd4',
            'type': 'column',
            'title': 'Volume:',
            'useLineColorForBulletBorder': true,
            'valueField': 'volume',
            'fillAlphas': 0.050,
            'markerType': 'none',
            'clustered': false,
            'showBalloon': false
            //'balloonText': '[[title]]<br /><b style='font-size: 130%'>[[value]]</b>'
          } ],
        'valueAxes': [{
          'precision': 2,
          'title': 'Price',
          'lineThickness': 1,
          'columnWidth': 25,
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
          'title': 'Volume',
          'gridAlpha': 0,
          'position': 'right',
          'axisAlpha': 0.15,
          'minimum': 0,
          'minMaxMultiplier': 5,
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
          'valueLineBalloonEnabled': false
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
  }

  ngAfterViewInit() {

    const { model, granularity, zone } = this;

    const prepData = arr => arr
      .map(i => Object.assign({}, i, {
        date: moment(i.time).toDate(),
        formattedTime: moment(i.time).format('LT')
      }))
      .filter(i => i.high !== 0);

    this.currentpriceService.getOrderHistoryByMinute()
      .subscribe(items => {
        zone.run(() => {
          model['1'] = prepData(items);
        });
        if (granularity === 1)
          this.updatePriceChart();
      });

    this.currentpriceService.getOrderHistoryBy15Minutes()
      .subscribe(items => {
        zone.run(() => {
          model['2'] = prepData(items);
        });
        if (granularity === 2)
          this.updatePriceChart();
      });

    this.currentpriceService.getOrderHistoryBy1Hour()
      .subscribe(items => {
        zone.run(() => {
          model['3'] = prepData(items);
        });
        if (granularity === 3)
          this.updatePriceChart();
      });

    this.currentpriceService.onPair()
      .subscribe(pair => {
        // TODO Figure out zoom out
        // this.chart.AmSerialChart.zoomOut();
        this.pairUpdated = true;
      });

  }

  updatePriceChart() {
    const items = this.model[this.granularity];
    // Workaround for zooming chart out after switching trading pairs
    if (this.pairUpdated)
      this.chart.zoomOutOnDataUpdate = true;
    this.chart.dataProvider = items;
    this.chart.validateData();
    this.chart.zoomOutOnDataUpdate = false;
    this.pairUpdated = false;
  }
}
