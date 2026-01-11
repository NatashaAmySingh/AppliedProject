import React, { useState, useEffect } from "react";
import axios from "axios";
import Header from "../components/header";
import Sidebar from "../components/Sidebar";
import { logout } from "../utils/auth";
import { loadCountries, getCountryName } from "../utils/meta";

export default function RequestDetail() {
  const [request, setRequest] = useState(null);
  const [status, setStatus] = useState("");
  const [users, setUsers] = useState([]);
  const [assigningTo, setAssigningTo] = useState('');

  const isDark = typeof document !== 'undefined' && document.documentElement.classList.contains('dark');

  const statusBadgeStyle = (s) => {
    if (!isDark) return {};
    if (s === 'Pending') return { backgroundColor: 'var(--warning)', color: '#06121a' };
    if (s === 'Responded') return { backgroundColor: 'var(--accent-2)', color: '#071423' };
    return { backgroundColor: 'var(--success)', color: '#071423' };
  };

  // grab ?id= from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");

    if (!id) return;

    const token = localStorage.getItem("token");
    axios
      .get(`/requests/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setRequest(res.data);
        setStatus(res.data.status);
      })
      .catch((err) => console.error("Failed to load request:", err));

    // ensure country names available
    loadCountries().catch(() => {});
    // load users for assignment
    axios.get('/users', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => {
        setUsers(r.data || []);
        if (r.data && r.data.length && request && !request.assigned_user_id) {
          setAssigningTo('');
        }
      })
      .catch(() => setUsers([]));
  }, []);

  const updateStatus = (newStatus) => {
    setStatus(newStatus);
    if (!request) return;

    const token = localStorage.getItem("token");
    axios
      .put(`/requests/${request.request_id}`, { status: newStatus }, { headers: { Authorization: `Bearer ${token}` } })
      .catch((err) => console.error("Failed to update status:", err));
  };

  if (!request) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
        <Header />
        <section className="flex h-full w-full flex-row">
          <Sidebar />
          <div className="h-screen w-[84%] overflow-y-auto bg-gray-200 dark:bg-gray-800 shadow-2xs pt-[130px] p-6">
            <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Loading...</h1>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <Header />

      <section className="flex h-full w-full flex-row">
        <Sidebar />

        <div className="h-screen w-[84%] overflow-y-auto bg-gray-200 dark:bg-gray-800 shadow-2xs pt-[130px] p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl" style={{ color: 'var(--accent)' }}>Request Detail</h1>
            <div className="flex gap-3">
              <button
                onClick={() => (window.location.href = "/requests")}
                className="rounded-md bg-gray-500 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-600 dark:bg-gray-700 dark:hover:bg-gray-600"
              >
                Back to Requests
              </button>
              <button
                onClick={logout}
                className="rounded-md bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-500"
              >
                Logout
              </button>
            </div>
          </div>

          {/* Request Info */}
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:bg-gray-800 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Request #{String(request.request_id).padStart(5, "0")}
            </h2>
            <div className="space-y-3 text-sm text-gray-700 dark:text-gray-200">
              <p>
                <span className="font-semibold text-gray-800 dark:text-gray-100">Claimant:</span>{" "}
                <span className="text-gray-700 dark:text-gray-200">{request.first_name} {request.last_name}</span>
              </p>
              <p>
                <span className="font-semibold text-gray-800 dark:text-gray-100">Target Country:</span>{" "}
                <span className="text-gray-700 dark:text-gray-200">{getCountryName(request.target_country_id) || "-"}</span>
              </p>
              <p>
                <span className="font-semibold text-gray-800 dark:text-gray-100">Date Created:</span>{" "}
                <span className="text-gray-700 dark:text-gray-200">{new Date(request.created_at).toLocaleDateString()}</span>
              </p>
              <p>
                <span className="font-semibold text-gray-800 dark:text-gray-100">Benefit Type:</span>{" "}
                <span className="text-gray-700 dark:text-gray-200">{(request.benefit_type && request.benefit_type.name) || request.benefit_type_id || "-"}</span>
              </p>
              {request.benefit_type && request.benefit_type.description ? (
                <p className="text-sm text-gray-600 dark:text-gray-400">{request.benefit_type.description}</p>
              ) : null}
              <p>
                <span className="font-semibold text-gray-800 dark:text-gray-100">Status:</span>{" "}
                <select
                  value={status}
                  onChange={(e) => updateStatus(e.target.value)}
                  className={`rounded border px-2 py-1 text-xs font-medium ${
                    status === "Pending"
                      ? "bg-amber-100 text-amber-700"
                      : status === "Responded"
                      ? "bg-cyan-100 text-cyan-700"
                      : "bg-green-100 text-green-700"
                  }`}
                  style={statusBadgeStyle(status)}
                >
                  <option value="Pending">Pending</option>
                  <option value="Responded">Responded</option>
                  <option value="Closed">Closed</option>
                </select>
              </p>
              <p>
                <span className="font-semibold text-gray-800 dark:text-gray-100">Assigned To:</span>{" "}
                <span className="text-gray-700 dark:text-gray-200">{request.assigned_to || "-"}</span>
              </p>
              {['1','2'].includes(localStorage.getItem('role')) ? (
                <div className="mt-2 flex items-center gap-2">
                  <select
                    value={assigningTo}
                    onChange={(e) => setAssigningTo(e.target.value)}
                    className="rounded border px-2 py-1 text-sm"
                  >
                    <option value="">-- assign --</option>
                    {users.map(u => (
                      <option key={u.id} value={u.id}>{u.name || u.email}</option>
                    ))}
                  </select>
                  <button
                    onClick={async () => {
                      if (!assigningTo) return;
                      try {
                        const token = localStorage.getItem('token');
                        await axios.put(`/requests/${request.request_id}/assign`, { user_id: assigningTo }, { headers: { Authorization: `Bearer ${token}` } });
                        // update local UI
                        const u = users.find(x => String(x.id) === String(assigningTo));
                        setRequest(r => ({ ...r, assigned_to: u ? u.name : String(assigningTo), assigned_user_id: assigningTo }));
                        setAssigningTo('');
                      } catch (err) {
                        console.error('Assign failed', err);
                        alert('Failed to assign request');
                      }
                    }}
                    className="rounded bg-blue-600 px-3 py-1 text-white text-sm"
                  >
                    Assign
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}