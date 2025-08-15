import { useState, useEffect } from 'react';
import { useAnalytics } from './hooks/useAnalytics';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, CartesianGrid
} from 'recharts';

const COLORS = ['#007AFF', '#00C49F', '#FFBB28', '#FF6B6B', '#5856D6'];

const AnalyticsDashboard = () => {
  const [eventsData, setEventsData] = useState<any[]>([]);
  const [devicesData, setDevicesData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { getAnalyticsData } = useAnalytics();

  // Summary KPIs
  const totalViews = eventsData.reduce((sum, { count }) => sum + count, 0);
  const avgViews = totalViews ? (totalViews / eventsData.length).toFixed(1) : '0';
  const topDevice = devicesData.reduce((max, device) =>
    device.value > max.value ? device : max, { name: '', value: 0 }).name || 'N/A';

  useEffect(() => {
    const loadData = async () => {
      try {
        const events = await getAnalyticsData('page_view', 7);

        const getDeviceType = (event) => {
          // Check if device information exists
          if (!event?.metadata?.device) return 'Other';

          const { type } = event.metadata.device;

          // If type is missing or empty, return 'Other'
          if (!type || typeof type !== 'string' || type.trim() === '') return 'Other';

          // Normalize the type string
          const lowerType = type.toLowerCase().trim();

          // Check for known device types
          if (lowerType.includes('mobile')) return 'Mobile';
          if (lowerType.includes('tablet')) return 'Tablet';
          if (lowerType.includes('desktop')) return 'Desktop';
          if (lowerType.includes('bot')) return 'Bot';

          // For any other non-empty type, return it capitalized
          return type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
        };

        const eventCounts = events.reduce((acc, event) => {
          const date = event.timestamp.toDate().toLocaleDateString();
          acc[date] = (acc[date] || 0) + 1;
          return acc;
        }, {});

        const deviceDistribution = events.reduce((acc, event) => {
          const deviceType = getDeviceType(event);
          acc[deviceType] = (acc[deviceType] || 0) + 1;
          return acc;
        }, {});

        setEventsData(
          Object.entries(eventCounts).map(([date, count]) => ({
            date,
            count,
          }))
        );

        setDevicesData(
          Object.entries(deviceDistribution)
            .map(([name, value]) => ({
              name: name === 'Unknown' ? 'Other' : name, // Rename Unknown to Other if preferred
              value,
            }))
            .sort((a, b) => b.value - a.value) // Sort by most common
        );
      } catch (error) {
        console.error('Error loading analytics:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [getAnalyticsData]);

  if (isLoading) {
    return (
      <section
        role="status"
        aria-live="polite"
        className="flex justify-center items-center h-64"
      >
        <div
          className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"
          aria-label="Loading data"
        />
      </section>
    );
  }

  return (
    <main className="bg-white rounded-xl shadow p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-8">Analytics Dashboard</h1>

      {/* KPI Summary */}
      <section
        aria-label="Summary metrics"
        className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8"
      >
        <article className="bg-blue-50 p-4 rounded-lg shadow-sm">
          <h2 className="text-sm font-semibold text-blue-600">Total Page Views</h2>
          <p className="text-3xl font-bold text-blue-900">{totalViews}</p>
        </article>
        <article className="bg-green-50 p-4 rounded-lg shadow-sm">
          <h2 className="text-sm font-semibold text-green-600">Average Views per Day</h2>
          <p className="text-3xl font-bold text-green-900">{avgViews}</p>
        </article>
        <article className="bg-purple-50 p-4 rounded-lg shadow-sm">
          <h2 className="text-sm font-semibold text-purple-600">Top Device</h2>
          <p className="text-3xl font-bold text-purple-900 capitalize">{topDevice}</p>
        </article>
      </section>

      {/* Charts */}
      <section
        aria-label="Detailed analytics charts"
        className="grid grid-cols-1 lg:grid-cols-2 gap-10"
      >
        <article
          className="bg-gray-50 p-6 rounded-lg shadow"
          aria-label="Page Views over the last 7 days"
        >
          <h2 className="text-xl font-semibold mb-4">Page Views (Last 7 Days)</h2>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={eventsData} role="img" aria-label="Bar chart of page views by date">
              <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
              <XAxis
                dataKey="date"
                stroke="#4B5563"
                tick={{ fontSize: 12, fill: '#374151' }}
                angle={-45}
                textAnchor="end"
                height={60}
                interval={0}
              />
              <YAxis
                stroke="#4B5563"
                tick={{ fontSize: 12, fill: '#374151' }}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{ backgroundColor: '#f9fafb', borderRadius: '6px' }}
                formatter={(value: number) => [value, 'Views']}
              />
              <Legend wrapperStyle={{ fontSize: 14, fontWeight: '600' }} />
              <Bar dataKey="count" name="Page Views" fill="#007AFF" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </article>

        <article
          className="bg-gray-50 p-6 rounded-lg shadow"
          aria-label="Device type distribution pie chart"
        >
          <h2 className="text-xl font-semibold mb-4">Device Distribution</h2>
          <ResponsiveContainer width="100%" height={320}>
            <PieChart role="img" aria-label="Pie chart showing device distribution">
              <Pie
                data={devicesData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                nameKey="name"
                label={({ name, percent }) =>
                  `${name}: ${(percent * 100).toFixed(0)}%`
                }
              >
                {devicesData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: '#f9fafb', borderRadius: '6px' }}
                formatter={(value: number, name: string) => [`${value}`, name]}
              />
            </PieChart>
          </ResponsiveContainer>
        </article>
      </section>
    </main>
  );
};

export default AnalyticsDashboard;
