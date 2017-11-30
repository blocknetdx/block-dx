import { Component, NgZone, ViewChild, ElementRef } from '@angular/core';

import * as jQuery from 'jquery';

declare var TradingView;
declare var Datafeeds;

@Component({
  selector: 'pricechart',
  templateUrl: './pricechart.component.html',
  styleUrls: ['./pricechart.component.scss']
})
export class PricechartComponent {
  @ViewChild('container')
  public container: ElementRef;

  private widget: any;

  constructor(
    private zone: NgZone
  ) { }

  ngAfterViewInit() {
    this.zone.runOutsideAngular(() => {
      this.widget = new TradingView.widget({
        debug: false,
        fullscreen: false,
        interval: 'W',
        timeframe: '1M',
        container_id: "tv_chart_container",
        //	BEWARE: no trailing slash is expected in feed URL
        symbol: 'AAPL',
        datafeed: new Datafeeds.UDFCompatibleDatafeed("https://demo_feed.tradingview.com"),
        // symbol: 'BTC',
        // datafeed: new Datafeeds.UDFCompatibleDatafeed("http://localhost:3000"),
        library_path: "assets/charting_library/",
        locale: "en",
        //	Regression Trend-related functionality is not implemented yet, so it's hidden for a while
        drawings_access: { type: 'black', tools: [{ name: "Regression Trend" }, { name: "" }] },
        enabled_features: ["chart_property_page_trading" ], // "move_logo_to_main_pane"
        disabled_features: ["use_localstorage_for_settings", "left_toolbar", "header_saveload", "chart_property_page_scales",
          "header_settings", "header_compare", "header_undo_redo", "chart_property_page_style", "header_screenshot",
          "header_symbol_search", "header_interval_dialog_button", "volume_force_overlay"], // "header_indicators",
        charts_storage_url: 'http://saveload.tradingview.com',
        charts_storage_api_version: "1.1",
        client_id: 'tradingview.com',
        user_id: 'public_user_id',
        toolbar_bg: '#172e48',

        favorites: {
          // intervals: ["1D", "3D", "3W", "W"],
          // chartTypes: ["Area", "Line"]
        },
        overrides: {
          "paneProperties.background": "#0f2742",
          "paneProperties.vertGridProperties.color": "#0f2742",
          "paneProperties.horzGridProperties.color": "#0f2742",
          "symbolWatermarkProperties.transparency": 40,
          "scalesProperties.textColor": "#AAA",
          "mainSeriesProperties.candleStyle.upColor": "#4BF5C6",
          "mainSeriesProperties.candleStyle.downColor": "#FF7E70",
          "mainSeriesProperties.candleStyle.drawWick": true,
          "mainSeriesProperties.candleStyle.drawBorder": true,
          "mainSeriesProperties.candleStyle.borderColor": "#454545",
          "mainSeriesProperties.candleStyle.borderUpColor": "#4BF5C6",
          "mainSeriesProperties.candleStyle.borderDownColor": "#FF7E70",
          "mainSeriesProperties.candleStyle.wickUpColor": 'rgba( 115, 115, 117, 1)',
          "mainSeriesProperties.candleStyle.wickDownColor": 'rgba( 115, 115, 117, 1)',
          "mainSeriesProperties.candleStyle.barColorsOnPrevClose": false,
          "volumePaneSize": "medium"
        },
        studies_overrides: {
          "volume.volume.color.0": "#4BF5C6",
          "volume.volume.color.1": "#FF7E70",
          "volume.volume.transparency": 80,
          "volume.show ma": false,
        },
        width: '100%',
        height: '100%',
        time_frames: [
            { text: "1y", resolution: "W",  title: "1yr" },
            { text: "6m", resolution: "W" },
            { text: "1m", resolution: "D" },
            { text: "1000y", resolution: "W", description: "All", title: "All" },
        ]
      });

      this.widget.onChartReady(() => {
        this.zone.run(() => {
          // console.log('this.widget is ready');
        });
      });
    });
  }
}
