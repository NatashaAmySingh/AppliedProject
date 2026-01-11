import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Header from '../components/header';
import Sidebar from '../components/Sidebar';
import ReportsCharts from '../components/ReportsCharts';
import { loadCountries, getCountryName } from '../utils/meta';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export default function Reports() {
  const [metrics, setMetrics] = useState({
    avgResponseTime: null,
    totalRequests: 0,
    completionRate: 0,
    fastestResponse: null,
    fastestCountry: null,
    openRequests: 0,
    closedRequests: 0,
    countriesActive: 0,
  });

  const [loading, setLoading] = useState(false);
  const [range, setRange] = useState('Last 30 Days');
  const [requestsForCharts, setRequestsForCharts] = useState([]);

  useEffect(() => {
    let mounted = true;
    const token = localStorage.getItem('token');
    setLoading(true);

    (async () => {
      try {
        const res = await axios.get(`/requests`, { headers: { Authorization: `Bearer ${token}` } });
        if (!mounted) return;
        const requests = Array.isArray(res.data) ? res.data : [];

        let filtered = requests;
        if (range === 'Last 30 Days') {
          const cutoff = new Date();
          cutoff.setDate(cutoff.getDate() - 30);
          filtered = requests.filter((r) => new Date(r.created_at) >= cutoff);
        } else if (range === 'Last Quarter') {
          const cutoff = new Date();
          cutoff.setMonth(cutoff.getMonth() - 3);
          filtered = requests.filter((r) => new Date(r.created_at) >= cutoff);
        } else if (range === 'Year to Date') {
          const now = new Date();
          const startYear = new Date(now.getFullYear(), 0, 1);
          filtered = requests.filter((r) => new Date(r.created_at) >= startYear);
        }

        // ensure countries cache is available for name mapping
        await loadCountries();

        const total = filtered.length;
        const closed = filtered.filter((r) => r.status === 'Closed').length;
        const open = total - closed;

        const completionRate = total > 0 ? parseFloat(((closed / total) * 100).toFixed(1)) : 0;

        const responseTimes = filtered
          .filter((r) => r.response_date)
          .map((r) => (new Date(r.response_date) - new Date(r.created_at)) / (1000 * 60 * 60 * 24));

        const avgResponseTime = responseTimes.length > 0 ? parseFloat((responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length).toFixed(1)) : null;

        let fastestResponse = null;
        let fastestCountry = null;
        if (responseTimes.length > 0) {
          const minIndex = responseTimes.indexOf(Math.min(...responseTimes));
          fastestResponse = parseFloat(responseTimes[minIndex].toFixed(1));
          // ensure countries cache is loaded so we can display names
          await loadCountries();
          fastestCountry = getCountryName(filtered[minIndex]?.target_country_id) || 'N/A';
        }

        setMetrics({
          avgResponseTime,
          totalRequests: total,
          completionRate,
          fastestResponse,
          fastestCountry,
          openRequests: open,
          closedRequests: closed,
          countriesActive: new Set(filtered.map((r) => getCountryName(r.target_country_id))).size,
        });

        setRequestsForCharts(filtered);
      } catch (err) {
        console.error('Failed to load reports:', err);
      } finally {
        setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [range]);

  const exportReport = async () => {
    const el = document.getElementById('reportsView');
    if (!el) {
      alert('Nothing to export');
      return;
    }

    try {
      setLoading(true);
      const canvas = await html2canvas(el, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');

      const pdf = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgScaledWidth = imgWidth * ratio;
      const imgScaledHeight = imgHeight * ratio;

      pdf.addImage(imgData, 'PNG', (pdfWidth - imgScaledWidth) / 2, 20, imgScaledWidth, imgScaledHeight);

      const filename = `report-${range.replace(/[^a-z0-9_-]/gi, '_')}-${Date.now()}.pdf`;
      pdf.save(filename);
    } catch (err) {
      console.error('PDF export failed:', err);
      alert('PDF export failed. See console for details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <Header />

      <section className="flex h-[100%] w-full flex-row">
        <Sidebar />

        <div className="h-screen w-[84%] overflow-y-auto bg-gray-200 dark:bg-gray-800 shadow-2xs pt-[130px]">
          <div className="flex items-center justify-between px-[20px]">
            <div>
              <h1 className="text-blue-400 dark:text-blue-300 text-3xl">Reports & Analytics</h1>
              <p className="mt-1 text-gray-700 dark:text-gray-300">View system statistics and generate reports</p>
            </div>
          </div>

          {/* Reports */}
          <div id="reportsView" className="px-6 py-6">
            {/* Filters */}
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <select
                value={range}
                onChange={(e) => setRange(e.target.value)}
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 sm:max-w-[220px]"
              >
                <option>Last 30 Days</option>
                <option>Last Quarter</option>
                <option>Year to Date</option>
                <option>Custom Range</option>
              </select>

              <button
                onClick={exportReport}
                className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-blue-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-200 sm:w-auto"
              >
                <span aria-hidden="true">📥</span>
                Export Report
              </button>
            </div>

            {/* Performance Metrics */}
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:bg-gray-800 dark:border-gray-700">
              <h3 className="text-sm font-semibold text-gray-900">Performance Metrics</h3>

              <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 dark:bg-gray-700 dark:border-gray-600">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Average Response Time</p>
                  <p className="mt-2 text-xl font-semibold text-gray-900">{loading ? 'Loading...' : (metrics.avgResponseTime !== null ? `${metrics.avgResponseTime} days` : 'N/A')}</p>
                </div>

                <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 dark:bg-gray-700 dark:border-gray-600">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Total Requests ({range})</p>
                  <p className="mt-2 text-xl font-semibold text-gray-900">{metrics.totalRequests}</p>
                </div>

                <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 dark:bg-gray-700 dark:border-gray-600">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Completion Rate</p>
                  <p className="mt-2 text-xl font-semibold text-gray-900">{metrics.completionRate}%</p>
                </div>

                <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 dark:bg-gray-700 dark:border-gray-600">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Fastest Response</p>
                  <p className="mt-2 text-xl font-semibold text-gray-900 dark:text-gray-100">{loading ? 'Loading...' : (metrics.fastestResponse !== null ? `${metrics.fastestResponse} days` : 'N/A')}</p>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-300">{metrics.fastestCountry || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Charts */}
            <ReportsCharts requests={requestsForCharts} range={range} />

            {/* Report Summary Table */}
            <div className="mt-6 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:bg-gray-800 dark:border-gray-700">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Report Summary</h3>
                <span className="text-xs text-gray-500 dark:text-gray-300">{range}</span>
              </div>

              <div className="overflow-auto rounded-xl border border-gray-100">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-700 text-xs font-semibold text-gray-600 dark:text-gray-300">
                    <tr>
                      <th className="px-4 py-3">Metric</th>
                      <th className="px-4 py-3">Value</th>
                      <th className="px-4 py-3">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-700 dark:text-gray-200">
                    <tr className="border-t border-gray-100 dark:border-gray-700">
                      <td className="px-4 py-3">Open Requests</td>
                      <td className="px-4 py-3">{metrics.openRequests}</td>
                      <td className="px-4 py-3 text-gray-500 dark:text-gray-300">Pending / In Progress</td>
                    </tr>
                    <tr className="border-t border-gray-100 bg-gray-50 dark:bg-gray-800">
                      <td className="px-4 py-3">Closed Requests</td>
                      <td className="px-4 py-3">{metrics.closedRequests}</td>
                      <td className="px-4 py-3 text-gray-500 dark:text-gray-300">Completed / Archived</td>
                    </tr>
                    <tr className="border-t border-gray-100 dark:border-gray-700">
                      <td className="px-4 py-3">Countries Active</td>
                      <td className="px-4 py-3">{metrics.countriesActive}</td>
                      <td className="px-4 py-3 text-gray-500 dark:text-gray-300">CARICOM agencies</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
