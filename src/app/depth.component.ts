import { Component, OnInit, AfterViewInit, OnChanges, NgZone, Input, ElementRef, ViewChild, OnDestroy } from '@angular/core';

import * as math from 'mathjs';
import * as _ from 'lodash';

import { AppService } from './app.service';
import { OrderbookService } from './orderbook.service';
import { Currentprice } from './currentprice';
import { CurrentpriceService } from './currentprice.service';
import {NumberFormatPipe} from './pipes/decimal.pipe';

math.config({
  number: 'BigNumber',
  precision: 64
});

const { bignumber } = math;

declare var AmCharts;

@Component({
  selector: 'app-depth',
  templateUrl: './depth.component.html',
  styleUrls: ['./depth.component.scss']
})
export class DepthComponent implements AfterViewInit, OnChanges, OnDestroy {
  public symbols:string[] = [];
  public currentPrice: Currentprice;
  public midMarketPrice = '';
  public currentPriceCSSPercentage = 0;
  public topChart: any;
  public bottomChart: any;
  public orderbook:any[] = [];

  @ViewChild('topChartContainer')
  public topChartContainer: ElementRef;

  @ViewChild('bottomChartContainer')
  public bottomChartContainer: ElementRef;

  private subscriptions = [];

  constructor(
    private zone: NgZone,
    private appService: AppService,
    private currentpriceService: CurrentpriceService,
    private orderbookService: OrderbookService,
    private numberFormatPipe: NumberFormatPipe
  ) {}

  static formatMMP(val): string {
    const price = parseFloat(val);
    const formattedPrice =  (
        (price >= 100000000) ? price.toFixed(0) :
        (price >= 10000000) ? price.toFixed(1) :
        (price >= 1000000) ? price.toFixed(2) :
        (price >= 100000) ? price.toFixed(3) :
        (price >= 10000) ? price.toFixed(4) :
        (price >= 1000) ? price.toFixed(5) :
        (price >= 100) ? price.toFixed(6) :
        (price >= 10) ? price.toFixed(7) :
        (price < 10) ? price.toFixed(8) :
        String(price));
    return formattedPrice;
  }

  private calculateTotal(price, size) {
    return math.round(math.multiply(bignumber(price), bignumber(size)), 6).toNumber();
  }

  ngAfterViewInit() {
    const { zone } = this;

    this.subscriptions.push(this.appService.marketPairChanges.subscribe((symbols) => {
      this.symbols = symbols;
    }));
    this.subscriptions.push(this.currentpriceService.currentprice.subscribe((cp) => {
      zone.run(() => {
        this.currentPrice = cp;
      });
    }));
    this.subscriptions.push(this.orderbookService.getOrderbook()
      .subscribe(orderbook => {

        // Function to process (sort and calculate cummulative volume)
        const processData = (list, type, desc) => {

          list = [...list];

          const res = [];

          // Convert to data points
          for(let i = 0; i < list.length; i++) {
            const value = Number(list[i][0]);
            const volume = Number(list[i][1]);
            const total = Number(list[i][5]);
            list[i] = {
              value,
              volume,
              total
            };
          }

          // Sort list just in case
          list.sort(function(a, b) {
            if (a.value < b.value) {
              return 1;
            } else if (a.value > b.value) {
              return -1;
            } else {
              return 0;
            }
          });

          if(desc) list.reverse();

          // Calculate cummulative volume
          for(let i = 0; i < list.length; i++) {
            if (i > 0) {
              list[i].totalvolume = list[i-1].totalvolume + list[i].volume;
              list[i].sum = list[i-1].sum + list[i].total;
            } else {
              list[i].totalvolume = list[i].volume;
              list[i].sum = list[i].total;
            }
            const dp = {};
            dp['total'] = list[i].total;
            dp['value'] = list[i].value;
            dp['sum'] = list[i].sum;
            dp[type + 'volume'] = list[i].volume;
            dp[type + 'totalvolume'] = list[i].totalvolume;
            res.push(dp);
          }

          const totalVolumeMap = new Map();

          const totalVolumeKey = type + 'totalvolume';

          for(const obj of res) {
            const totalVolume = obj[totalVolumeKey];
            totalVolumeMap.set(obj.value, totalVolume);
          }

          for(const obj of res) {
            obj[totalVolumeKey] = totalVolumeMap.get(obj.value);
          }

          if(desc) res.reverse();

          return res;

        };

        // Init
        const asks = processData(orderbook.asks, 'asks', true);
        const bids = processData(orderbook.bids, 'bids', false);

        const combined = [...asks, ...bids];
        this.orderbook = combined;

        const bidCount = combined
          .reduce((count, obj) => Object.keys(obj).includes('bidstotalvolume') ? count + 1 : count, 0);
        this.currentPriceCSSPercentage = (bidCount / combined.length) * 100;

        this.updateDepthChart();

        })
    );

    this.makeChart();
  }

  ngOnChanges() {
    // this.runDepthChart();
  }

  ngOnDestroy() {
    this.subscriptions
      .forEach(subscription => subscription.unsubscribe());

    if (this.topChart)
      this.topChart.clear();
    if (this.bottomChart)
      this.bottomChart.clear();
  }

  updateDepthChart() {
    const data = this.orderbook;

    const topChartData = data.filter(obj => obj.askstotalvolume ? true : false);
    const bottomChartData = data.filter(obj => obj.bidstotalvolume ? true : false);

    const topTotalVolume = topChartData.length > 0 ? topChartData[0].askstotalvolume : 0;
    const bottomTotalVolume = bottomChartData.length > 0 ? bottomChartData[bottomChartData.length - 1].bidstotalvolume : 0;

    const highestVolume = topTotalVolume > bottomTotalVolume ? topTotalVolume : bottomTotalVolume;

    const volumeAxisMax = (Math.floor(highestVolume / 50) + 1) * 50;

    let midMarketPrice;

    if(topChartData.length === 0 && bottomChartData.length === 0) {
      midMarketPrice = 0;
    } else if(topChartData.length > 0 && bottomChartData.length > 0) {
      midMarketPrice = math.divide(bignumber(topChartData[topChartData.length - 1].value + bottomChartData[0].value), 2);
    } else if(topChartData.length > 0) {
      midMarketPrice = topChartData[0].value;
    } else {
      midMarketPrice = bottomChartData[bottomChartData.length - 1].value;
    }

    this.midMarketPrice = DepthComponent.formatMMP(midMarketPrice);

    if (this.topChart) {
      // set a uniform x axis maximum value so the charts match
      this.topChart.valueAxes[0].maximum = volumeAxisMax;
      // update the chart dataset
      this.topChart.dataProvider = topChartData;
      this.topChart.validateData();
    }
    if (this.bottomChart) {
      // set a uniform x axis maximum value so the charts match
      this.bottomChart.valueAxes[0].maximum = volumeAxisMax;
      // update the chart dataset
      this.bottomChart.dataProvider = bottomChartData;
      this.bottomChart.validateData();
    }
  }

  makeChart(): void {

    const balloon = (item, graph) => {
      const { symbols } = this;
      let txt;
      if (graph.id === 'asks') {
        txt = 'Ask: <strong>' + formatNumber(item.dataContext.value, graph.chart, 6) + ' ' + symbols[1] + '</strong><br />'
          + 'Volume: <strong>' + formatNumber(item.dataContext.askstotalvolume, graph.chart, 2) + ' ' + symbols[0] + '</strong><br />'
          + 'Sum: <strong>' + formatNumber(item.dataContext.sum, graph.chart, 2) + ' ' + symbols[1] + '</strong>';
      } else {
        txt = 'Bid: <strong>' + formatNumber(item.dataContext.value, graph.chart, 6) + ' ' + symbols[1] + '</strong><br />'
          + 'Volume: <strong>' + formatNumber(item.dataContext.bidstotalvolume, graph.chart, 2) + ' ' + symbols[0] + '</strong><br />'
          + 'Sum: <strong>' + formatNumber(item.dataContext.sum, graph.chart, 2) + ' ' + symbols[1] + '</strong>';
      }
      return txt;
    };

    const formatNumber = (val, chart, precision) => {
      return AmCharts.formatNumber(
        val,
        {
          precision: precision ? precision : chart.precision,
          decimalSeparator: chart.decimalSeparator,
          thousandsSeparator: chart.thousandsSeparator
        }
      );
    };

    this.zone.runOutsideAngular(() => {

      // setTimeout(() => {
      //   const item = document.getElementById('chartdiv');
      //   const items = $(item).find('a');
      //   items.css('display', 'none');
      // }, 0);

      // Top chart
      if (this.topChart)
        this.topChart.clear();

      this.topChart = AmCharts.makeChart(this.topChartContainer.nativeElement, {
        'responsive': {
          'enabled': true
        },
        'type': 'serial',
        'theme': 'dark',
        'dataProvider': [],
        'graphs': [
          {
            'id': 'asks',
            'fillAlphas': .4,
            'lineAlpha': 1,
            'lineThickness': 1,
            'lineColor': '#FF7E70',
            fillColors: [
              '#172E48',
              '#FF7E70'
            ],
            'type': 'step',
            'valueField': 'askstotalvolume',
            'balloonFunction': balloon
          },
        ],
        'categoryField': 'value',
        'chartCursor': {},
        'balloon': {
          'textAlign': 'left',
          'disableMouseEvents': true,
          'fixedPosition': true,
          'horizontalPadding': 5,
          'verticalPadding': 2,
          'borderThickness': 1,
          'pointerWidth': 6,
          'fontSize': 10,
          'fillAlpha': 1
        },
        'valueAxes': [
          {
            showFirstLabel: false,
            showLastLabel: false,
            inside: true,
            gridAlpha: 0,
            position: top,
            axisAlpha: 0,
            color: 'rgba(0, 0, 0, 0)',

            // The following two properties are for if we want to force a certain number of axis labels.
            // Changing these values leads to unpredictable behavior and is not recommended without further testing.
            // autoGridCount: false,
            // gridCount: 3
          }
        ],
        'categoryAxis': {
          'gridAlpha': 0,
          'minVerticalGap': 100,
          'startOnAxis': true,
          'showFirstLabel': false,
          'showLastLabel': false,
          'inside': true,
          'balloon': {
            'fontSize': 0,
            'color': '#FFFFFF'
            // 'enabled' : false  // TODO: This isn't working for some reason.
          },

          // The following two properties are for if we want to force a certain number of axis labels.
          // Changing these values leads to unpredictable behavior and is not recommended without further testing.
          // autoGridCount: false,
          // gridCount: 4
        },
        'mouseWheelZoomEnabled': true,
        'rotate': true,
        'export': {
          'enabled': false
        },
        'listeners': [
          {
            'event': 'rendered',
            'method': function(event) {
              // var chart = event.chart;
              // var chartCursor = new AmCharts.ChartCursor();
              // chart.addChartCursor(chartCursor);
              // chartCursor.enabled=false;
            }
          },
          // {
          //   'event': 'clickGraphItem',
          //   'method': e => {
          //     console.log('Clicked!', e);
          //   }
          // }
        ]
      });

      // Bottom Chart
      if (this.bottomChart)
        this.bottomChart.clear();

      this.bottomChart = AmCharts.makeChart(this.bottomChartContainer.nativeElement, {
        'responsive': {
          'enabled': true
        },
        'type': 'serial',
        'theme': 'dark',
        'dataProvider': [],
        'graphs': [
          {
            'id': 'bids',
            'fillAlphas': .4,
            'lineAlpha': 1,
            'lineThickness': 1,
            'lineColor': '#4BF5C6',
            fillColors: [
              '#4BF5C6',
              '#172E48'
            ],
            'type': 'step',
            'valueField': 'bidstotalvolume',
            'balloonFunction': balloon
          }
        ],
        'categoryField': 'value',
        'chartCursor': {},
        'balloon': {
          'textAlign': 'left',
          'disableMouseEvents': true,
          'fixedPosition': true,
          'horizontalPadding': 5,
          'verticalPadding': 2,
          'borderThickness': 1,
          'pointerWidth': 3,
          'fontSize': 10,
          'fillAlpha': 1
        },
        'valueAxes': [
          {
            'showFirstLabel': false,
            'showLastLabel': false,
            'inside': true,
            'gridAlpha': 0,
            position: 'bottom',

            // The following two properties are for if we want to force a certain number of axis labels.
            // Changing these values leads to unpredictable behavior and is not recommended without further testing.
            // autoGridCount: false,
            // gridCount: 3
          }
        ],
        'categoryAxis': {
          'gridAlpha': 0,
          'minVerticalGap': 100,
          'startOnAxis': true,
          'showFirstLabel': false,
          'showLastLabel': false,
          'inside': true,
          'balloon': {
            'fontSize': 0,
            'color': '#FFFFFF'
            // 'enabled' : false  // TODO: This isn't working for some reason.
          },

          // The following two properties are for if we want to force a certain number of axis labels.
          // Changing these values leads to unpredictable behavior and is not recommended without further testing.
          // autoGridCount: false,
          // gridCount: 4
        },
        'mouseWheelZoomEnabled': true,
        'rotate': true,
        'export': {
          'enabled': false
        },
        'listeners': [
          {
            'event': 'rendered',
            'method': function(event) {
              // var chart = event.chart;
              // var chartCursor = new AmCharts.ChartCursor();
              // chart.addChartCursor(chartCursor);
              // chartCursor.enabled=false;
            }
          },
          // {
          //   'event': 'clickGraphItem',
          //   'method': e => {
          //     console.log('Clicked!', e);
          //   }
          // }
        ]
      });

      // this.chart.addListener('clickGraphItem', () => {
      //   console.log('Clicked!');
      //   alert('Clicked!');
      // });

      // console.log(this.chart);

    });

    // this.zone.runOutsideAngular(() => {
    //   this.chart = AmCharts.makeChart('chartdiv', {
    //     'responsive': {
    //       'enabled': true
    //     },
    //     'type': 'serial',
    //     'theme': 'dark',
    //     'dataLoader': {
    //       'url': '/assets/api/orderbook' + this.symbols.join('_') + '.json',
    //       'format': 'json',
    //       'reload': 3000000000,
    //       'postProcess': function(data) {
    //
    //         // Function to process (sort and calculate cummulative volume)
    //         function processData(list, type, desc) {
    //
    //           // Convert to data points
    //           for(var i = 0; i < list.length; i++) {
    //             list[i] = {
    //               value: Number(list[i][0]),
    //               volume: Number(list[i][1]),
    //             }
    //           }
    //
    //           // Sort list just in case
    //           list.sort(function(a, b) {
    //             if (a.value > b.value) {
    //               return 1;
    //             }
    //             else if (a.value < b.value) {
    //               return -1;
    //             }
    //             else {
    //               return 0;
    //             }
    //           });
    //
    //           // Calculate cummulative volume
    //           if (desc) {
    //             for(var i = list.length - 1; i >= 0; i--) {
    //               if (i < (list.length - 1)) {
    //                 list[i].totalvolume = list[i+1].totalvolume + list[i].volume;
    //               }
    //               else {
    //                 list[i].totalvolume = list[i].volume;
    //               }
    //               var dp = {};
    //               dp['value'] = list[i].value;
    //               dp[type + 'volume'] = list[i].volume;
    //               dp[type + 'totalvolume'] = list[i].totalvolume;
    //               res.unshift(dp);
    //             }
    //           }
    //           else {
    //             for(var i = 0; i < list.length; i++) {
    //               if (i > 0) {
    //                 list[i].totalvolume = list[i-1].totalvolume + list[i].volume;
    //               }
    //               else {
    //                 list[i].totalvolume = list[i].volume;
    //               }
    //               var dp = {};
    //               dp['value'] = list[i].value;
    //               dp[type + 'volume'] = list[i].volume;
    //               dp[type + 'totalvolume'] = list[i].totalvolume;
    //               res.push(dp);
    //             }
    //           }
    //
    //         }
    //
    //         // Init
    //         var res = [];
    //         processData(data.bids, 'bids', true);
    //         processData(data.asks, 'asks', false);
    //
    //         //console.log(res);
    //         return res;
    //       }
    //     },
    //     'graphs': [{
    //       'id': 'bids',
    //       'fillAlphas': 0.1,
    //       'lineAlpha': 1,
    //       'lineThickness': 2,
    //       'lineColor': '#4BF5C6',
    //       'type': 'step',
    //       'valueField': 'bidstotalvolume',
    //       'balloonFunction': balloon
    //     }, {
    //       'id': 'asks',
    //       'fillAlphas': 0.1,
    //       'lineAlpha': 1,
    //       'lineThickness': 2,
    //       'lineColor': '#FF7E70',
    //       'type': 'step',
    //       'valueField': 'askstotalvolume',
    //       'balloonFunction': balloon
    //     },
    //      {
    //       'lineAlpha': 0,
    //       'fillAlphas': 0.2,
    //       'lineColor': '#FFF',
    //       'type': 'column',
    //       'clustered': false,
    //       'valueField': 'bidsvolume',
    //       'showBalloon': false
    //     }, {
    //       'lineAlpha': 0,
    //       'fillAlphas': 0.2,
    //       'lineColor': '#FFF',
    //       'type': 'column',
    //       'clustered': false,
    //       'valueField': 'asksvolume',
    //       'showBalloon': false
    //     }
    //   ],
    //     'categoryField': 'value',
    //     'chartCursor': {},
    //     'balloon': {
    //       'textAlign': 'left',
    //       'disableMouseEvents': true,
    //       'fixedPosition': false,
    //       'fillAlpha': 1
    //     },
    //     'valueAxes': [{
    //       'showFirstLabel': false,
    //       'showLastLabel': false,
    //       'inside': true,
    //       'gridAlpha': 0
    //     }],
    //     'categoryAxis': {
    //       'gridAlpha': 0,
    //       'minVerticalGap': 100,
    //       'startOnAxis': true,
    //       'showFirstLabel': false,
    //       'showLastLabel': false,
    //       'inside': true,
    //       'balloon': {
    //         'fontSize': 0,
    //         'color': '#FFFFFF'
    //         // 'enabled' : false  // TODO: This isn't working for some reason.
    //       }
    //     },
    //     'mouseWheelZoomEnabled': true,
    //     'rotate': true,
    //     'export': {
    //       'enabled': false
    //     },
    //     'listeners': [{
    //       'event': 'rendered',
    //       'method': function(event) {
    //         // var chart = event.chart;
    //         // var chartCursor = new AmCharts.ChartCursor();
    //         // chart.addChartCursor(chartCursor);
    //         // chartCursor.enabled=false;
    //       }
    //     }]
    //   });
    //
    //   // console.log(this.chart);
    //
    //   function balloon(item, graph) {
    //     var txt;
    //     if (graph.id == 'asks') {
    //       txt = 'Ask: <strong>' + formatNumber(item.dataContext.value, graph.chart, 4) + '</strong><br />'
    //         + 'Volume: <strong>' + formatNumber(item.dataContext.askstotalvolume, graph.chart, 4) + '</strong><br />'
    //         + 'Sum: <strong>' + formatNumber(item.dataContext.asksvolume, graph.chart, 4) + '</strong>';
    //     }
    //     else {
    //       txt = 'Bid: <strong>' + formatNumber(item.dataContext.value, graph.chart, 4) + '</strong><br />'
    //         + 'Volume: <strong>' + formatNumber(item.dataContext.bidstotalvolume, graph.chart, 4) + '</strong><br />'
    //         + 'Sum: <strong>' + formatNumber(item.dataContext.bidsvolume, graph.chart, 4) + '</strong>';
    //     }
    //     return txt;
    //   }
    //
    //   function formatNumber(val, chart, precision) {
    //     return AmCharts.formatNumber(
    //       val,
    //       {
    //         precision: precision ? precision : chart.precision,
    //         decimalSeparator: chart.decimalSeparator,
    //         thousandsSeparator: chart.thousandsSeparator
    //       }
    //     );
    //   }
    // });

  }

}
