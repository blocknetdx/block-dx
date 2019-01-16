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

  private widget: any;
  private granularity = 2; // 1: minute, 2: 15 minutes, 3: 30 minutes
  private chart: any;
  private model = { 1: [], 2: [], 3: [] };

  constructor(
    private currentpriceService: CurrentpriceService,
    private zone: NgZone
  ) {
    this.chart = AmCharts.makeChart( 'tv_chart_container', {
      'type': 'serial',
      'theme': 'dark',
      'valueAxes': [{
        'position': 'left'
      }],
      zoomOutOnDataUpdate: false, // when true this causes chart to jump around unexpectedly
      mouseWhellScrollEnabled: false,
      mouseWheelZoomEnabled: false,
      parseDates: true,
      'graphs': [ {
        'id': 'g1',
        'balloonText': 'Open:<b>[[open]]</b><br>Low:<b>[[low]]</b><br>High:<b>[[high]]</b><br>Close:<b>[[close]]</b><br>Time:<b>[[formattedTime]]</b><br>',
        'closeField': 'close',
        'fillColors': '#4bf5c6',
        'highField': 'high',
        'lineColor': '#4bf5c6',
        'lineAlpha': 1,
        'lowField': 'low',
        'fillAlphas': 1,
        'negativeFillColors': '#ff7e70',
        'negativeLineColor': '#ff7e70',
        'openField': 'open',
        'title': 'Price:',
        'type': 'candlestick',
        'valueField': 'close'
      } ],
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
  }

  ngAfterViewInit() {

    const { model, granularity } = this;

    const prepData = arr => arr
      .map(i => Object.assign({}, i, {
        date: moment(i.time).toDate(),
        formattedTime: moment(i.time).format('LT')
      }))
      .filter(i => i.high !== 0);

    this.currentpriceService.getOrderHistoryByMinute()
      .subscribe(items => {
        model['1'] = prepData(items);
        if (granularity === 1)
          this.updatePriceChart();
      });

    this.currentpriceService.getOrderHistoryBy15Minutes()
      .subscribe(items => {
        model['2'] = prepData(items);
        if (granularity === 2)
          this.updatePriceChart();
      });

    this.currentpriceService.getOrderHistoryBy1Hour()
      .subscribe(items => {
        model['3'] = prepData(items);
        if (granularity === 3)
          this.updatePriceChart();
      });

  }

  /*renderPriceChart() {

    const items = this.model[this.granularity];

    const end = new Date();

    this.zone.runOutsideAngular(() => {
      const chart = AmCharts.makeChart( 'tv_chart_container', {
        'type': 'serial',
        'theme': 'dark',
        'valueAxes': [{
          'position': 'left'
        }],
        zoomOutOnDataUpdate: true,
        mouseWhellScrollEnabled: false,
        mouseWheelZoomEnabled: false,
        parseDates: true,
        'graphs': [ {
          'id': 'g1',
          'balloonText': 'Open:<b>[[open]]</b><br>Low:<b>[[low]]</b><br>High:<b>[[high]]</b><br>Close:<b>[[close]]</b><br>Time:<b>[[formattedTime]]</b><br>',
          'closeField': 'close',
          'fillColors': '#4bf5c6',
          'highField': 'high',
          'lineColor': '#4bf5c6',
          'lineAlpha': 1,
          'lowField': 'low',
          'fillAlphas': 1,
          'negativeFillColors': '#ff7e70',
          'negativeLineColor': '#ff7e70',
          'openField': 'open',
          'title': 'Price:',
          'type': 'candlestick',
          'valueField': 'close'
        } ],
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
        dataProvider: items,
        'export': {
          'enabled': false,
          'position': 'bottom-right'
        }
      });

      this.chart = chart;

      // chart.addListener( 'rendered', () => {
      //   zoomChart();
      // });

      setTimeout(() => {

        // chart.addListener('zoomed', e => {
        //
        //   if ( chart.ignoreZoomEvent ) {
        //     chart.ignoreZoomEvent = false;
        //     return;
        //   }
        //
        //   const { startDate, endDate } = e;
        //   const diff = endDate.getTime() - startDate.getTime();
        //   const { granularity } = this;
        //   console.log(granularity);
        //   console.log((diff / 60000).toFixed(0));
        //   let minPeriod;
        //   if(diff < 7200000) {
        //     this.granularity = 1;
        //     minPeriod = 'mm';
        //   } else if(diff < 72000000) {
        //     this.granularity = 2;
        //     minPeriod = '15mm';
        //   } else { // >= 72000000
        //     this.granularity = 3;
        //     minPeriod = '30mm';
        //   }
        //
        //   chart.ignoreZoomEvent = true;
        //   chart.categoryAxis.minPeriod = minPeriod;
        //   chart.lastZoomEvent = event;
        //
        //   this.updatePriceChart();
        //
        // });
        // chart.addListener('dataUpdated', e => {
        //   if ( chart.lastZoomEvent !== undefined ) {
        //     chart.ignoreZoomEvent = true;
        //     chart.zoomToDates( chart.lastZoomEvent.startDate, chart.lastZoomEvent.endDate );
        //   }
        // });

      }, 100);

      // this method is called when chart is first inited as we listen for 'dataUpdated' event
      function zoomChart() {
        // different zoom methods can be used - zoomToIndexes, zoomToDates, zoomToCategoryValues
        chart.zoomToIndexes( chart.dataProvider.length - 60, chart.dataProvider.length - 1 );
      }
    });
  }*/

  updatePriceChart() {
    const items = this.model[this.granularity];
    this.chart.dataProvider = items;
    this.chart.validateData();
  }

}
