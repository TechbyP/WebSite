import { useState, useEffect } from 'react';
import { useAnalytics } from './hooks/useAnalytics';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../firebase'; // Make sure this points to your Firebase config file

interface PerformanceMetrics {
  dns: number;
  tcp: number;
  request: number;
  response: number;
  domLoaded: number;
  fullLoad: number;
  fcp: number;
  lcp: number;
  cls: number;
  inp: number;
  tbt: number;
}

interface HistoricalData {
  timestamp: Date;
  metrics: Partial<PerformanceMetrics>;
}

const metricDescriptions: Record<keyof PerformanceMetrics, string> = {
  dns: 'DNS lookup time',
  tcp: 'TCP connection time',
  request: 'Request time',
  response: 'Response time',
  domLoaded: 'DOM content loaded',
  fullLoad: 'Full page load',
  fcp: 'First Contentful Paint',
  lcp: 'Largest Contentful Paint',
  cls: 'Cumulative Layout Shift',
  inp: 'Interaction to Next Paint',
  tbt: 'Total Blocking Time',
};

const COLORS = {
  fcp: '#2563EB', // blue-600
  lcp: '#059669', // green-600
  cls: '#D97706', // amber-600
};

const PerformanceMonitor = () => {
  const [currentMetrics, setCurrentMetrics] = useState<Partial<PerformanceMetrics>>({});
  const [historicalData, setHistoricalData] = useState<HistoricalData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { trackEvent, getAnalyticsData } = useAnalytics();

  const getNavigationTiming = () => {
    try {
      const navEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navEntry) return navEntry;

      // Fallback to legacy timing if Navigation Timing API v2 isn't available
      const timing = performance.timing;
      return {
        domainLookupStart: timing.domainLookupStart,
        domainLookupEnd: timing.domainLookupEnd,
        connectStart: timing.connectStart,
        connectEnd: timing.connectEnd,
        requestStart: timing.requestStart,
        responseStart: timing.responseStart,
        responseEnd: timing.responseEnd,
        domContentLoadedEventEnd: timing.domContentLoadedEventEnd,
        loadEventEnd: timing.loadEventEnd,
        startTime: timing.navigationStart
      };
    } catch (e) {
      console.error('Navigation timing error:', e);
      return null;
    }
  };

  const withTimeout = <T,>(promise: Promise<T>, ms: number, fallback: T): Promise<T> => {
    return Promise.race([
      promise,
      new Promise<T>((resolve) => setTimeout(() => resolve(fallback), ms))
    ]);
  };

  const getCLS = async (): Promise<number> => {
    if (!('PerformanceObserver' in window)) return 0;

    return withTimeout(new Promise<number>((resolve) => {
      let cls = 0;
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        if (!entries.length) return;

        cls = entries.reduce((acc, entry: any) => acc + entry.value, 0);
        observer.disconnect();
        resolve(cls);
      });

      try {
        observer.observe({ type: 'layout-shift', buffered: true });
      } catch (e) {
        console.error('CLS observation error:', e);
        resolve(0);
      }
    }), 2000, 0);
  };

  const getINP = async (): Promise<number> => {
    if (!('PerformanceObserver' in window)) return 0;

    return withTimeout(new Promise<number>((resolve) => {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        if (!entries.length) return;

        const inp = Math.max(...entries.map((e: any) => e.duration));
        observer.disconnect();
        resolve(inp);
      });

      try {
        observer.observe({ type: 'event', buffered: true });
      } catch (e) {
        console.error('INP observation error:', e);
        resolve(0);
      }
    }), 2000, 0);
  };

  const getTBT = async (): Promise<number> => {
    if (!('PerformanceObserver' in window)) return 0;

    return withTimeout(new Promise<number>((resolve) => {
      let tbt = 0;
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        if (!entries.length) return;

        entries.forEach((entry: any) => {
          if (entry.duration > 50) tbt += entry.duration - 50;
        });
        observer.disconnect();
        resolve(tbt);
      });

      try {
        observer.observe({ type: 'longtask', buffered: true });
      } catch (e) {
        console.error('TBT observation error:', e);
        resolve(0);
      }
    }), 2000, 0);
  };

  const collectPerformanceMetrics = async () => {
    try {
      const [cls, inp, tbt] = await Promise.all([
        getCLS(),
        getINP(),
        getTBT()
      ]);

      const navigation = getNavigationTiming();
      const fcpEntry = performance.getEntriesByName('first-contentful-paint')[0];
      const lcpEntries = performance.getEntriesByType('largest-contentful-paint');

      const metrics: Partial<PerformanceMetrics> = {
        dns: navigation ? navigation.domainLookupEnd - navigation.domainLookupStart : 0,
        tcp: navigation ? navigation.connectEnd - navigation.connectStart : 0,
        request: navigation ? navigation.responseStart - navigation.requestStart : 0,
        response: navigation ? navigation.responseEnd - navigation.responseStart : 0,
        domLoaded: navigation ? navigation.domContentLoadedEventEnd - navigation.startTime : 0,
        fullLoad: navigation ? navigation.loadEventEnd - navigation.startTime : 0,
        fcp: fcpEntry ? fcpEntry.startTime : 0,
        lcp: lcpEntries.length ? lcpEntries[lcpEntries.length - 1].startTime : 0,
        cls,
        inp,
        tbt,
      };

      setCurrentMetrics(metrics);
      await addDoc(collection(db, 'analytics'), {
        event: 'performance_metrics',
        timestamp: new Date(),
        metadata: metrics  // Ensure metrics are included
      });
      setHistoricalData((prev) => [...prev.slice(-29), { timestamp: new Date(), metrics }]);
    } catch (error) {
      console.error('Error collecting metrics:', error);
      setCurrentMetrics({});
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    const init = async () => {
      await collectPerformanceMetrics();

      if (isMounted) {
        const interval = setInterval(collectPerformanceMetrics, 30000);
        return () => clearInterval(interval);
      }
    };

    init();

    return () => {
      isMounted = false;
    };
  }, [trackEvent]);

  useEffect(() => {
    const loadHistoricalData = async () => {
      try {
        const data = await getAnalyticsData('performance_metrics');
        if (!data?.length) return;

        const formatted = data
          .filter((d) => d.timestamp)
          .map((d) => ({
            timestamp: d.timestamp.toDate(),
            metrics: d.metadata,
          }));

        setHistoricalData(formatted.slice(-30));
      } catch (error) {
        console.error('Error loading historical data:', error);
      }
    };

    loadHistoricalData();
  }, [getAnalyticsData]);

  const formatMetricValue = (value: number, key: keyof PerformanceMetrics) => {
    if (value === undefined || isNaN(value)) return 'N/A';
    if (key === 'cls') return value.toFixed(4);
    if (key === 'inp' || key === 'tbt') return `${Math.round(value)} ms`;
    return `${value.toFixed(2)} ms`;
  };

  return (
    <section
      aria-label="Performance Metrics Dashboard"
      className="bg-white rounded-xl shadow-md p-6 max-w-7xl mx-auto"
    >
      <h2 className="text-xl font-semibold mb-6 text-gray-900">Performance Metrics</h2>

      {isLoading ? (
        <div className="flex justify-center items-center h-64" role="status" aria-live="polite">
          <svg
            className="animate-spin h-12 w-12 text-blue-600"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8H4z"
            />
          </svg>
          <span className="sr-only">Loading metrics...</span>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-8">
            {Object.entries(currentMetrics).map(([key, value]) => (
              <article
                key={key}
                className="bg-gray-50 rounded-lg p-4 shadow-sm"
                aria-label={`${metricDescriptions[key as keyof PerformanceMetrics]} metric`}
              >
                <h3 className="text-sm font-medium text-gray-700 capitalize">{key}</h3>
                <p className="text-xs text-gray-500 mb-1">
                  {metricDescriptions[key as keyof PerformanceMetrics]}
                </p>
                <p className="text-2xl font-semibold text-gray-900">
                  {value !== undefined ? formatMetricValue(value, key as keyof PerformanceMetrics) : 'N/A'}
                </p>
              </article>
            ))}
          </div>

          {historicalData.length > 1 && (
            <section aria-label="Performance Trends Graph" className="h-64">
              <h3 className="text-lg font-semibold mb-4 text-gray-900">Performance Trends (Last 30 data points)</h3>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={historicalData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="timestamp"
                    tickFormatter={(time) => new Date(time).toLocaleTimeString()}
                    stroke="#6b7280"
                    minTickGap={20}
                  />
                  <YAxis stroke="#6b7280" />
                  <Tooltip
                    formatter={(value: number, name: string) => [
                      formatMetricValue(value, name as keyof PerformanceMetrics),
                      name.toUpperCase(),
                    ]}
                    labelFormatter={(time) => new Date(time).toLocaleString()}
                  />
                  <Legend verticalAlign="top" height={36} />
                  <Line
                    type="monotone"
                    dataKey="metrics.fcp"
                    name="FCP"
                    stroke={COLORS.fcp}
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="metrics.lcp"
                    name="LCP"
                    stroke={COLORS.lcp}
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="metrics.cls"
                    name="CLS"
                    stroke={COLORS.cls}
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </section>
          )}
        </>
      )}
    </section>
  );
};

export default PerformanceMonitor;