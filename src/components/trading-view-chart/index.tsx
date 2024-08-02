import styles from "./index.module.css";
import { useEffect, useRef } from "react";
import {
  ChartingLibraryWidgetOptions,
  LanguageCode,
  ResolutionString,
  widget,
} from "../../../public/static/charting_library";
import { CandleDto, TokenDto } from "@/lib/data/dtos";
import { useDatafeed } from "./datafeed";

export const TVChartContainer = (props: {
  token: TokenDto;
  candles: CandleDto[];
}) => {
  const chartContainerRef =
    useRef<HTMLDivElement>() as React.MutableRefObject<HTMLInputElement>;

  const datafeed = useDatafeed(props.token, props.candles);

  const defaultWidgetProps: Partial<ChartingLibraryWidgetOptions> = {
    interval: "5" as ResolutionString,
    library_path: "/static/charting_library/",
    locale: "en",
    charts_storage_api_version: "1.1",
    client_id: "tradingview.com",
    user_id: "public_user_id",
    fullscreen: false,
    autosize: true,
  };

  useEffect(() => {
    const widgetOptions: ChartingLibraryWidgetOptions = {
      symbol: props.token.symbol,
      datafeed,
      interval: defaultWidgetProps.interval as ResolutionString,
      timeframe: "5D" as ResolutionString,
      container: chartContainerRef.current,
      library_path: defaultWidgetProps.library_path,
      locale: defaultWidgetProps.locale as LanguageCode,
      disabled_features: [
        "use_localstorage_for_settings",
        "header_symbol_search",
      ],
      enabled_features: ["study_templates"],
      charts_storage_url: defaultWidgetProps.charts_storage_url,
      charts_storage_api_version: defaultWidgetProps.charts_storage_api_version,
      client_id: defaultWidgetProps.client_id,
      user_id: defaultWidgetProps.user_id,
      fullscreen: defaultWidgetProps.fullscreen,
      autosize: defaultWidgetProps.autosize,
      theme: "Dark",
    };

    const tvWidget = new widget(widgetOptions);

    tvWidget.onChartReady(() => {
      tvWidget.headerReady().then(() => {
        //const button = tvWidget.createButton();
        //button.setAttribute('title', 'Click to show a notification popup');
        //button.classList.add('apply-common-tooltip');
        //button.addEventListener('click', () => tvWidget.showNoticeDialog({
        //	title: 'Notification',
        //	body: 'TradingView Charting Library API works correctly',
        //	callback: () => {
        //		console.log('Noticed!');
        //	},
        //}));
        //button.innerHTML = 'Check API';
      });
    });

    return () => {
      tvWidget.remove();
    };
  }, [props.token.symbol]);

  return <div ref={chartContainerRef} className={styles.TVChartContainer} />;
};
