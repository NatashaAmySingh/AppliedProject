import { useState, useEffect } from "react";
import axios from "axios";
import Header from "../components/header";
import Sidebar from "../components/Sidebar";
import { loadCountries, getCountryName } from "../utils/meta";

export default function Dashboard() {
  const [stats, setStats] = useState({
    pending: 0,
    awaiting: 0,
    completed: 0,
    overdue: 0,
  });
  const [recentRequests, setRecentRequests] = useState([]);
  const [requests, setRequests] = useState([]);
  const [clientStatus, setClientStatus] = useState({});

  // Data loaders
  const loadDashboardStats = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("/requests", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const requests = res.data;

      setStats({
        pending: requests.filter((r) => r.status === "Pending").length,
        awaiting: requests.filter((r) => r.status === "Responded").length,
        completed: requests.filter((r) => r.status === "Closed").length,
        overdue: requests.filter(
          (r) => r.status === "Pending" && new Date(r.due_date) < new Date()
        ).length,
      });
    } catch (err) {
      console.error("Failed to load dashboard:", err);
    }
  };

  const loadRecentRequests = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("/requests", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const requests = res.data;

      requests.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setRecentRequests(requests.slice(0, 5));
    } catch (err) {
      console.error("Failed to load recent requests:", err);
    }
  };

  const loadRequests = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("/requests", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRequests(res.data);
    } catch (err) {
      console.error("Failed to load requests:", err);
    }
  };

  useEffect(() => {
    loadDashboardStats();
    loadRecentRequests();
    loadRequests();
    loadCountries().catch(() => {});
  }, []);

  const updateStatus = (requestId, newStatus) => {
    setClientStatus((prev) => ({ ...prev, [requestId]: newStatus }));
  };

  const changeStatus = async (requestId, newStatus) => {
    try {
      const token = localStorage.getItem("token");
      await axios.patch(
        `/requests/${requestId}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // refresh local data
      await Promise.all([loadDashboardStats(), loadRecentRequests(), loadRequests()]);
    } catch (err) {
      console.error("Failed to change status:", err);
    }
  };

  const showRequestDetail = (requestId) => {
    window.location.href = `/request-detail?id=${requestId}`;
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Page Header */}
      <Header />


      <section className="flex h-[100%] w-full flex-row">
        <Sidebar />

        <div className="h-screen w-[84%] overflow-y-auto bg-gray-200 dark:bg-gray-800 shadow-2xs pt-[130px]">
          {/* Dashboard View (Tailwind, responsive, matches your new styling) */}
          <div id="dashboardView" className="px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
            {/* Top welcome */}
            <div className="mb-5">
              <h2 className="text-2xl font-semibold text-gray-900">{`Welcome back, ${localStorage.getItem('first_name') || ''} ${localStorage.getItem('last_name') || ''}`.trim() || 'Welcome'}</h2>
              <p className="mt-1 text-sm text-gray-600">Here's what's happening with your CARICOM requests today</p>
            </div>

            {/* Quick stats */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:bg-gray-700 dark:border-gray-600">
                  <div className="text-3xl font-semibold text-gray-900 dark:text-gray-100">{stats.pending}</div>
                  <div className="mt-1 text-sm text-gray-600 dark:text-gray-300">Pending Requests</div>
                </div>

                <div className="rounded-2xl border border-amber-100 bg-amber-50 p-5 shadow-sm dark:border-amber-700 dark:bg-amber-900/10">
                  <div className="text-3xl font-semibold text-gray-900 dark:text-gray-100">{stats.awaiting}</div>
                  <div className="mt-1 text-sm text-gray-700 dark:text-gray-300">Awaiting Your Response</div>
                </div>

                <div className="rounded-2xl border border-green-100 bg-green-50 p-5 shadow-sm dark:border-green-700 dark:bg-green-900/10">
                  <div className="text-3xl font-semibold text-gray-900 dark:text-gray-100">{stats.completed}</div>
                  <div className="mt-1 text-sm text-gray-700 dark:text-gray-300">Completed This Month</div>
                </div>

                <div className="rounded-2xl border border-red-100 bg-red-50 p-5 shadow-sm dark:border-red-700 dark:bg-red-900/10">
                  <div className="text-3xl font-semibold text-gray-900 dark:text-gray-100">{stats.overdue}</div>
                  <div className="mt-1 text-sm text-gray-700 dark:text-gray-300">Overdue</div>
                </div>
              </div>

            {/* Recent Requests Table */}
            <div className="mt-6 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h3 className="text-sm font-semibold text-gray-900">Recent Requests</h3>

                <button
                  type="button"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-blue-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-200 sm:w-auto"
                  onClick={() => window.location.href = '/new-request'}
                >
                  <span aria-hidden="true">➕</span>
                  New Request
                </button>
              </div>

              <div className="overflow-x-auto">
                <div className="min-w-[600px] overflow-hidden rounded-xl border border-gray-100">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 text-xs font-semibold text-gray-600">
                      <tr>
                        <th className="px-4 py-3">Request ID</th>
                        <th className="px-4 py-3">Claimant Name</th>
                        <th className="px-4 py-3">Target Country</th>
                        <th className="px-4 py-3">Date Created</th>
                        <th className="px-4 py-3">Status</th>
                      </tr>
                    </thead>

                    <tbody className="text-gray-700">
                      {recentRequests.map((r) => (
                        <tr
                          key={r.request_id}
                          className="border-t border-gray-100 bg-gray-50 hover:bg-gray-100"
                          onClick={() => showRequestDetail(r.request_id)}
                        >
                          <td className="px-4 py-3 font-medium">{r.request_id}</td>
                          <td className="px-4 py-3">{r.first_name} {r.last_name}</td>
                          <td className="px-4 py-3">{getCountryName(r.target_country_id) || "-"}</td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            {new Date(r.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3">
                            <select
                              value={clientStatus[r.request_id] ?? r.status}
                              onChange={async (e) => {
                                e.stopPropagation();
                                const newStatus = e.target.value;
                                updateStatus(r.request_id, newStatus);
                                await changeStatus(r.request_id, newStatus);
                              }}
                              onClick={(e) => e.stopPropagation()}
                              className="rounded-full bg-white px-3 py-1 text-xs font-medium"
                            >
                              <option value="Pending">Pending</option>
                              <option value="Responded">Responded</option>
                              <option value="Closed">Closed</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>


            {/* Little hint so users know rows are clickable */}
            <p className="mt-3 text-xs text-gray-500">Tip: click a row to open request details.</p>
          </div>
        </div>
      </section>
    </div>
  );
}