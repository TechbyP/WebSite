import { useCallback, useEffect, useMemo, useState } from 'react';
import { collection, getDocs, limit, orderBy, query, Timestamp } from 'firebase/firestore';
import { FiExternalLink, FiRefreshCw } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { db } from '../../firebase';
import { Skeleton } from './ui/Skeleton';

type AiSignalType = 'ai_referral' | 'feed_read' | 'feed_access_edge' | string;

type AiSignal = {
  id: string;
  type: AiSignalType;
  source: string;
  referrer: string;
  landingPath: string;
  feedPath: string;
  conversionType: string;
  conversionValue: string;
  userAgent: string;
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  timestamp: Date | null;
};

type AggregateItem = {
  key: string;
  count: number;
};

const MAX_SIGNAL_ROWS = 300;

const toDate = (value: unknown): Date | null => {
  if (value instanceof Timestamp) {
    return value.toDate();
  }

  if (value instanceof Date) {
    return value;
  }

  if (typeof value === 'string') {
    const parsedDate = new Date(value);
    return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
  }

  return null;
};

const sanitizeText = (value: unknown) => (typeof value === 'string' ? value : '');

const aggregateTop = (values: string[], topN = 8) => {
  const counts = new Map<string, number>();

  values.forEach((value) => {
    if (!value) {
      return;
    }

    counts.set(value, (counts.get(value) ?? 0) + 1);
  });

  return [...counts.entries()]
    .map(([key, count]) => ({ key, count }))
    .sort((left, right) => right.count - left.count)
    .slice(0, topN);
};

const formatSignalType = (type: string) => {
  if (type === 'ai_referral') {
    return 'AI referral';
  }

  if (type === 'feed_read') {
    return 'Feed read (browser)';
  }

  if (type === 'feed_access_edge') {
    return 'Feed access (edge/proxy)';
  }

  if (type === 'ai_conversion') {
    return 'AI-attributed conversion';
  }

  return type.replace(/_/g, ' ');
};

const formatRelativeTime = (value: Date | null) => {
  if (!value) {
    return 'Unknown';
  }

  const diffMs = Date.now() - value.getTime();
  const minutes = Math.floor(diffMs / 60000);

  if (minutes < 1) {
    return 'just now';
  }

  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours}h ago`;
  }

  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

export default function AiSignalsPanel({ isDarkMode }: { isDarkMode: boolean }) {
  const [signals, setSignals] = useState<AiSignal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const mapSnapshot = useCallback((snapshot: Awaited<ReturnType<typeof getDocs>>) => {
    return snapshot.docs.map((documentSnapshot) => {
      const data = documentSnapshot.data() as Record<string, unknown>;
      const timestamp = toDate(data.receivedAt) ?? toDate(data.timestamp);

      return {
        id: documentSnapshot.id,
        type: sanitizeText(data.type),
        source: sanitizeText(data.source),
        referrer: sanitizeText(data.referrer),
        landingPath: sanitizeText(data.landingPath),
        feedPath: sanitizeText(data.feedPath),
        conversionType: sanitizeText(data.conversionType),
        conversionValue: sanitizeText(data.conversionValue),
        userAgent: sanitizeText(data.userAgent),
        utm_source: sanitizeText(data.utm_source),
        utm_medium: sanitizeText(data.utm_medium),
        utm_campaign: sanitizeText(data.utm_campaign),
        timestamp,
      } as AiSignal;
    });
  }, []);

  const fetchAiSignals = useCallback(async () => {
    setIsLoading(true);

    try {
      const collectionRef = collection(db, 'ai_signals');

      try {
        const recentSnapshot = await getDocs(
          query(collectionRef, orderBy('receivedAt', 'desc'), limit(MAX_SIGNAL_ROWS))
        );
        setSignals(mapSnapshot(recentSnapshot));
      } catch {
        const fallbackSnapshot = await getDocs(
          query(collectionRef, orderBy('timestamp', 'desc'), limit(MAX_SIGNAL_ROWS))
        );
        setSignals(mapSnapshot(fallbackSnapshot));
      }
    } catch (error) {
      console.error('Error fetching ai signals:', error);
      toast.error('Failed to load AI telemetry signals.');
    } finally {
      setIsLoading(false);
    }
  }, [mapSnapshot]);

  useEffect(() => {
    void fetchAiSignals();
  }, [fetchAiSignals]);

  const metrics = useMemo(() => {
    const total = signals.length;
    const referrals = signals.filter((signal) => signal.type === 'ai_referral').length;
    const feedReads = signals.filter((signal) => signal.type === 'feed_read').length;
    const edgeFeedAccesses = signals.filter((signal) => signal.type === 'feed_access_edge').length;
    const conversions = signals.filter((signal) => signal.type === 'ai_conversion').length;

    const topSources = aggregateTop(
      signals.map((signal) => signal.source || signal.referrer)
    );

    const topFeeds = aggregateTop(
      signals
        .filter((signal) => signal.feedPath)
        .map((signal) => signal.feedPath)
    );

    const campaigns = aggregateTop(
      signals
        .filter((signal) => signal.utm_source || signal.utm_medium || signal.utm_campaign)
        .map((signal) => [signal.utm_source, signal.utm_medium, signal.utm_campaign].filter(Boolean).join(' / '))
    );

    return {
      total,
      referrals,
      feedReads,
      edgeFeedAccesses,
      conversions,
      topSources,
      topFeeds,
      campaigns,
    };
  }, [signals]);

  const Card = ({ title, value }: { title: string; value: string | number }) => (
    <div
      className={`rounded-xl shadow-lg p-5 border ${
        isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}
    >
      <p className={`text-xs uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
        {title}
      </p>
      <p className={`text-3xl font-black mt-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{value}</p>
    </div>
  );

  const renderAggregate = (title: string, items: AggregateItem[], emptyText: string) => (
    <div
      className={`rounded-xl shadow-lg p-5 border ${
        isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}
    >
      <h3 className={`text-lg font-black uppercase mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
        {title}
      </h3>
      {items.length === 0 ? (
        <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{emptyText}</p>
      ) : (
        <ul className="space-y-2">
          {items.map((item) => (
            <li key={item.key} className="flex items-start justify-between gap-3">
              <span className={`text-sm break-all ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{item.key}</span>
              <span
                className={`text-xs px-2 py-1 rounded-full whitespace-nowrap ${
                  isDarkMode ? 'bg-green-900/30 text-green-300' : 'bg-brandgreen/10 text-brandgreen'
                }`}
              >
                {item.count}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button
          onClick={() => {
            void fetchAiSignals();
          }}
          className={`text-sm flex items-center gap-2 px-3 py-2 rounded-lg border ${
            isDarkMode
              ? 'bg-gray-800 border-gray-700 text-gray-200 hover:bg-gray-700'
              : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
          }`}
        >
          <FiRefreshCw className="w-4 h-4" />
          Refresh signals
        </button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, index) => (
            <Skeleton key={index} className={`h-32 rounded-xl ${isDarkMode ? 'bg-gray-700' : ''}`} />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card title="Total signals" value={metrics.total} />
            <Card title="AI referrals" value={metrics.referrals} />
            <Card title="Feed reads (browser)" value={metrics.feedReads} />
            <Card title="Feed reads (edge/proxy)" value={metrics.edgeFeedAccesses} />
            <Card title="AI conversions" value={metrics.conversions} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {renderAggregate('Top sources', metrics.topSources, 'No referral sources yet.')}
            {renderAggregate('Top feed paths', metrics.topFeeds, 'No feed requests yet.')}
            {renderAggregate('Campaign tags', metrics.campaigns, 'No UTM-tagged signals yet.')}
          </div>

          <div
            className={`rounded-xl shadow-lg p-5 border ${
              isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className={`text-lg font-black uppercase ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Recent signals
              </h3>
              <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Showing {Math.min(signals.length, 80)} of {signals.length}
              </span>
            </div>

            {signals.length === 0 ? (
              <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>No AI telemetry signals recorded yet.</p>
            ) : (
              <ul className="space-y-3 max-h-[560px] overflow-auto pr-2">
                {signals.slice(0, 80).map((signal) => (
                  <li
                    key={signal.id}
                    className={`rounded-lg p-4 border ${
                      isDarkMode ? 'bg-gray-700/70 border-gray-600' : 'bg-gray-50 border-gray-100'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {formatSignalType(signal.type)}
                        </p>
                        <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {formatRelativeTime(signal.timestamp)}
                          {signal.timestamp ? ` (${signal.timestamp.toLocaleString()})` : ''}
                        </p>
                      </div>
                      {signal.feedPath ? (
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            isDarkMode ? 'bg-green-900/30 text-green-300' : 'bg-brandgreen/10 text-brandgreen'
                          }`}
                        >
                          {signal.feedPath}
                        </span>
                      ) : null}
                    </div>

                    <div className={`mt-3 text-sm space-y-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {signal.source ? <p><strong>source:</strong> {signal.source}</p> : null}
                      {signal.referrer ? (
                        <p className="break-all">
                          <strong>referrer:</strong> {signal.referrer}
                        </p>
                      ) : null}
                      {signal.landingPath ? <p><strong>landing:</strong> {signal.landingPath}</p> : null}
                      {signal.conversionType ? (
                        <p>
                          <strong>conversion:</strong>{' '}
                          {signal.conversionType}
                          {signal.conversionValue ? ` (${signal.conversionValue})` : ''}
                        </p>
                      ) : null}
                      {signal.utm_source || signal.utm_medium || signal.utm_campaign ? (
                        <p>
                          <strong>utm:</strong>{' '}
                          {[signal.utm_source, signal.utm_medium, signal.utm_campaign].filter(Boolean).join(' / ')}
                        </p>
                      ) : null}
                      {signal.userAgent ? (
                        <p className="break-all">
                          <strong>ua:</strong> {signal.userAgent}
                        </p>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ul>
            )}

            <p className={`text-xs mt-4 flex items-center gap-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Collection: ai_signals
              <FiExternalLink className="w-3 h-3" />
            </p>
          </div>
        </>
      )}
    </div>
  );
}
