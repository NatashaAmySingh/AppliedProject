import React from 'react';
import {
  ResponsiveContainer,
  LineChart as ReLineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart as ReBarChart,
  Bar,
  PieChart as RePieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { getCountryName } from '../utils/meta';

function formatDate(d) {
  const dt = new Date(d);
  return dt.toISOString().slice(0, 10);
}

export default function ReportsCharts({ requests = [] }) {
  // theme-aware colors from CSS variables
  const accent = (typeof window !== 'undefined') ? getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#7dd3fc' : '#7dd3fc';
  const accent2 = (typeof window !== 'undefined') ? getComputedStyle(document.documentElement).getPropertyValue('--accent-2').trim() || '#8b79f6' : '#8b79f6';
  const success = (typeof window !== 'undefined') ? getComputedStyle(document.documentElement).getPropertyValue('--success').trim() || '#66d6a6' : '#66d6a6';

  // Build time-series points by date
  const countsByDate = {};
  requests.forEach((r) => {
    const d = r.created_at || r.createdAt || r.date || new Date();
    const k = formatDate(d);
    countsByDate[k] = (countsByDate[k] || 0) + 1;
  });

  const points = Object.keys(countsByDate)
    .sort()
    .map((date) => ({ date, count: countsByDate[date] }));

  // Status breakdown
  const statusCounts = {};
  requests.forEach((r) => {
    const s = r.status || 'Unknown';
    statusCounts[s] = (statusCounts[s] || 0) + 1;
  });
  const statusItems = Object.keys(statusCounts).map((k) => ({ name: k, value: statusCounts[k] }));

  // Country breakdown (top 6)
  const countryCounts = {};
  requests.forEach((r) => {
    const c = getCountryName(r.target_country_id) || (r.target_country_id || 'Unknown');
    countryCounts[c] = (countryCounts[c] || 0) + 1;
  });
  const countryItems = Object.entries(countryCounts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);

  const pieColors = [accent.trim() || '#7dd3fc', accent2.trim() || '#8b79f6', success.trim() || '#66d6a6'];

  return (
    <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
      <div className="col-span-1 md:col-span-2 rounded-xl border border-gray-100 bg-white p-4 dark:bg-gray-800 dark:border-gray-700">
        <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-100">Requests Over Time</h4>
        <div className="mt-3" style={{ height: 220 }}>
          <ResponsiveContainer width="100%" height="100%">
            <ReLineChart data={points} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.06} />
              <XAxis dataKey="date" tick={{ fill: 'var(--muted)' }} />
              <YAxis tick={{ fill: 'var(--muted)' }} />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke={accent} strokeWidth={2} dot={{ r: 3 }} />
            </ReLineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-xl border border-gray-100 bg-white p-4 dark:bg-gray-800 dark:border-gray-700">
        <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-100">Status Distribution</h4>
        <div className="mt-3" style={{ height: 160 }}>
          <ResponsiveContainer width="100%" height="100%">
            <ReBarChart data={statusItems} layout="vertical" margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.04} />
              <XAxis type="number" tick={{ fill: 'var(--muted)' }} />
              <YAxis dataKey="name" type="category" width={80} tick={{ fill: 'var(--muted)' }} />
              <Tooltip />
              <Bar dataKey="value" fill={accent} />
            </ReBarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4">
          <h5 className="text-sm font-semibold text-gray-800 dark:text-gray-100">Top Countries</h5>
          <div className="mt-2" style={{ height: 140 }}>
            <ResponsiveContainer width="100%" height="100%">
              <RePieChart>
                <Pie data={countryItems} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={50} label>
                  {countryItems.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                  ))}
                </Pie>
                <Legend verticalAlign="bottom" height={24} />
              </RePieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
