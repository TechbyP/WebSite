// src/components/SecurityAuditLog.tsx
import { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, query, where, orderBy, onSnapshot, Timestamp } from 'firebase/firestore';
import { useAuth } from './hooks/AuthContext';
import { toast } from 'react-toastify';
import {
  FiShield,
  FiUser,
  FiLock,
  FiAlertTriangle,
  FiCheckCircle,
  FiSearch,
  FiFilter,
  FiDownload
} from 'react-icons/fi';
import { CSVLink } from 'react-csv';

interface AuditEvent {
  id: string;
  timestamp: Timestamp;
  eventType: string;
  userId: string;
  userEmail: string;
  ipAddress: string;
  userAgent: string;
  action: string;
  target: string;
  status: 'success' | 'failure' | 'warning';
  metadata?: Record<string, unknown>;
}

const eventTypeColors = {
  login: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  logout: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  permission_change: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  content_update: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  security_alert: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  system: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
};

const statusIcons = {
  success: <FiCheckCircle className="text-green-500" />,
  failure: <FiAlertTriangle className="text-red-500" />,
  warning: <FiAlertTriangle className="text-yellow-500" />
};

const SecurityAuditLog = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    eventType: '',
    status: '',
    dateRange: '7d'
  });

  useEffect(() => {
    if (!user) return;

    setLoading(true);
    setError(null);

    // Calculate date range
    const now = new Date();
    let startDate = new Date();

    switch (filters.dateRange) {
      case '24h':
        startDate.setDate(now.getDate() - 1);
        break;
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      case 'all':
      default:
        startDate = new Date(0); // Unix epoch
    }

    // Build the query
    let q = query(
      collection(db, 'auditLogs'),
      orderBy('timestamp', 'desc')
    );

    // Add filters
    const conditions = [];
    conditions.push(where('timestamp', '>=', startDate));

    if (filters.eventType) {
      conditions.push(where('eventType', '==', filters.eventType));
    }

    if (filters.status) {
      conditions.push(where('status', '==', filters.status));
    }

    // Apply all conditions
    if (conditions.length > 1) {
      q = query(q, ...conditions);
    } else if (conditions.length === 1) {
      q = query(q, conditions[0]);
    }

    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const auditEvents: AuditEvent[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          auditEvents.push({
            id: doc.id,
            ...data,
            timestamp: data.timestamp
          } as AuditEvent);
        });
        setEvents(auditEvents);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching audit logs:', err);
        setError('Failed to load security logs');
        setLoading(false);
        toast.error('Failed to load security logs');
      }
    );

    return () => unsubscribe();
  }, [user, filters]);

  const filteredEvents = events.filter(event =>
    event.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.target.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.ipAddress.includes(searchTerm)
  );

  const getEventTypeColor = (eventType: string) => {
    const type = eventType.toLowerCase() as keyof typeof eventTypeColors;
    return eventTypeColors[type] || eventTypeColors.system;
  };

  const prepareExportData = () => {
    return filteredEvents.map(event => ({
      Timestamp: event.timestamp.toDate().toISOString(),
      'Event Type': event.eventType,
      'User Email': event.userEmail,
      'IP Address': event.ipAddress,
      Action: event.action,
      Target: event.target,
      Status: event.status,
      'User Agent': event.userAgent,
      ...event.metadata
    }));
  };

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden">
      <div className="p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
          <h3 className="text-2xl font-bold dark:text-white flex items-center">
            <FiShield className="mr-2" /> Security Audit Log
          </h3>
          
          <div className="flex items-center space-x-3">
            <CSVLink 
              data={prepareExportData()} 
              filename={`security-audit-${new Date().toISOString()}.csv`}
              className="flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <FiDownload className="mr-2" /> Export
            </CSVLink>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search logs..."
              className="pl-10 w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select
            className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600"
            value={filters.eventType}
            onChange={(e) => setFilters({...filters, eventType: e.target.value})}
          >
            <option value="">All Event Types</option>
            <option value="login">Logins</option>
            <option value="logout">Logouts</option>
            <option value="permission_change">Permission Changes</option>
            <option value="content_update">Content Updates</option>
            <option value="security_alert">Security Alerts</option>
          </select>

          <select
            className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600"
            value={filters.status}
            onChange={(e) => setFilters({...filters, status: e.target.value})}
          >
            <option value="">All Statuses</option>
            <option value="success">Success</option>
            <option value="failure">Failure</option>
            <option value="warning">Warning</option>
          </select>

          <select
            className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600"
            value={filters.dateRange}
            onChange={(e) => setFilters({...filters, dateRange: e.target.value})}
          >
            <option value="24h">Last 24 hours</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="all">All time</option>
          </select>
        </div>

        {/* Audit Log Table */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="text-center py-12">
            <FiFilter className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium dark:text-gray-200">No audit events found</h3>
            <p className="mt-1 text-gray-500 dark:text-gray-400">
              Try adjusting your search or filter criteria
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Timestamp
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Event
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    User
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    IP Address
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Action
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredEvents.map((event) => (
                  <tr key={event.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {event.timestamp.toDate().toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getEventTypeColor(event.eventType)}`}>
                        {event.eventType.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-300">
                          <FiUser className="w-4 h-4" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium dark:text-white">
                            {event.userEmail}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {event.userId}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {event.ipAddress}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium dark:text-white">{event.action}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
                        {event.target}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {statusIcons[event.status]}
                        <span className="ml-2 capitalize">{event.status}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default SecurityAuditLog;