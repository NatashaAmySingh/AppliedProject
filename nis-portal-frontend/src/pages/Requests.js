import React, { useState, useEffect } from "react";
import axios from "axios";
import Header from "../components/header";
import Sidebar from "../components/Sidebar";
import { loadCountries, getCountryName } from "../utils/meta";
import { useLocation } from 'react-router-dom';

const API_URL = "";

export default function Requests() {
  const [requests, setRequests] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [countryFilter, setCountryFilter] = useState("All");
  const [countries, setCountries] = useState([]);
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const loadRequests = async () => {
      try {
        const res = await axios.get(`/requests`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const requestsData = res.data || [];

        // backend returns claimant fields joined; map into `claimant` for UI
        const shaped = requestsData.map((r) => ({
          ...r,
          claimant: { first_name: r.first_name, last_name: r.last_name },
        }));

        setRequests(shaped);
      } catch (err) {
        console.error("Failed to load requests:", err);
      }
    };

    loadRequests();

    const loadMeta = async () => {
      const cs = await loadCountries();
      setCountries(Array.isArray(cs) ? cs : []);
    };

    loadMeta();

    // initialize search from query param if present
    const params = new URLSearchParams(location.search);
    const q = params.get('search') || '';
    if (q) setSearch(q);
  }, []);

  const filteredRequests = requests.filter((r) => {
    const q = String(search || '').trim().toLowerCase();
    const claimantName = r.claimant
      ? `${r.claimant.first_name} ${r.claimant.last_name}`.toLowerCase()
      : "";
    const idStr = String(r.request_id || '');
    const nationalId = String(r.national_id || r.nationalId || '').toLowerCase();
    const countryName = String(getCountryName(r.target_country_id) || '').toLowerCase();
    const benefitName = String((r.benefit_type && r.benefit_type.name) || '').toLowerCase();

    const matchesSearch =
      q === "" ||
      claimantName.includes(q) ||
      idStr.includes(q) ||
      nationalId.includes(q) ||
      countryName.includes(q) ||
      benefitName.includes(q);
    const matchesStatus =
      statusFilter === "All" || (typeof statusFilter === 'string' && statusFilter.toLowerCase().includes('all')) || r.status === statusFilter;
    const matchesCountry =
      countryFilter === "All" ||
      String(r.target_country_id) === String(countryFilter);
    return matchesSearch && matchesStatus && matchesCountry;
  });

  const showRequestDetail = (id) => {
    window.location.href = `/request-detail?id=${id}`;
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <Header />

      <section className="flex h-full w-full flex-row">
        <Sidebar />

        <div className="flex-1 h-screen overflow-y-auto bg-gray-200 dark:bg-gray-800 shadow-2xs pt-[130px] px-6">
          <div className="flex items-center justify-between px-[20px]">
            <div>
              <h1 className="text-3xl heading-strong">All Requests</h1>
              <p className="mt-1 text-gray-700 dark:text-gray-300">
                Manage and track all CARICOM pension information requests
              </p>
            </div>
          </div>

          {/* Filters */}
          <div className="w-full mt-3">
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:bg-gray-800 dark:border-gray-700">
              <div className="space-y-3">
                <input
                  placeholder="Search by name or ID..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-[240px] rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                >
                  <option value="All">All Statuses</option>
                  <option value="Pending">Pending</option>
                  <option value="Responded">Responded</option>
                  <option value="Closed">Closed</option>
                </select>

                <select
                  value={countryFilter}
                  onChange={(e) => setCountryFilter(e.target.value)}
                  className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                >
                  <option value="All">All Countries</option>
                  {countries.map((c) => (
                    <option key={c.id} value={String(c.id)}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Table */}
              <div className="mt-4 max-h-[520px] overflow-auto rounded-xl border border-gray-100 bg-white dark:bg-gray-800 dark:border-gray-700">
                <table className="min-w-full divide-y divide-gray-100 text-left text-sm">
                  <thead className="sticky top-0 z-20 bg-white dark:bg-gray-800">
                    <tr className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                      <th className="px-4 py-3 border-b">Request ID</th>
                      <th className="px-4 py-3 border-b">Claimant Name</th>
                      <th className="px-4 py-3 border-b">Target Country</th>
                      <th className="px-4 py-3 border-b">Date Created</th>
                      <th className="px-4 py-3 border-b">Status</th>
                      <th className="px-4 py-3 border-b">Assigned To</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-700 dark:text-gray-200">
                    {filteredRequests.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                          No requests found.
                        </td>
                      </tr>
                    ) : (
                      filteredRequests.map((r, idx) => (
                        <tr
                          key={r.request_id}
                          className={`cursor-pointer ${idx % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-700'} hover:bg-gray-100 dark:hover:bg-gray-700 duration-150`}
                          onClick={() => showRequestDetail(r.request_id)}
                        >
                          <td className="px-4 py-4 align-top w-36">
                            <div className="text-xs text-gray-500">GY-2025</div>
                            <div className="mt-1 font-medium">{String(r.request_id).padStart(5, "0")}</div>
                          </td>
                          <td className="px-4 py-4 max-w-xs">
                            <div className="truncate">
                              {r.claimant
                                ? `${r.claimant.first_name} ${r.claimant.last_name}`
                                : `Claimant #${r.claimant_id}`}
                            </div>
                          </td>
                          <td className="px-4 py-4 w-44">{getCountryName(r.target_country_id) || "-"}</td>
                          <td className="px-4 py-4 w-40">{new Date(r.created_at).toLocaleDateString()}</td>
                          <td className="px-4 py-4 w-36">
                            <span
                              className={`inline-flex items-center rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-wide ${
                                r.status === "Pending"
                                  ? "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300"
                                  : r.status === "Responded"
                                  ? "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300"
                                  : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                              }`}
                            >
                              {r.status}
                            </span>
                          </td>
                          <td className="px-4 py-4 w-44 text-sm text-gray-600">{r.assigned_to || "-"}</td>
                        </tr>
                      ))
                    )}
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