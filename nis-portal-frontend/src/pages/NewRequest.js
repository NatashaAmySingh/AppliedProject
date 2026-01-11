import React, { useState, useEffect } from "react";
import axios from "axios";
import Header from "../components/header";
import Sidebar from "../components/Sidebar";

// Use relative paths so dev proxy handles the backend host and avoids CORS issues
const API_URL = "";

export default function NewRequest() {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    date_of_birth: "",
    sex: "",
    nis_number: "",
    national_id: "",
    target_country_id: "",
    benefit_type_id: "",
    employment_period: "",
    additional_notes: "",
  });
  const [files, setFiles] = useState([]);
  const [countries, setCountries] = useState([]);
  const [benefits, setBenefits] = useState([]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files));
  };

  const resetForm = () => {
    setFormData({
      first_name: "",
      last_name: "",
      date_of_birth: "",
      sex: "",
      nis_number: "",
      national_id: "",
      target_country_id: "",
      benefit_type_id: "",
      employment_period: "",
      additional_notes: "",
    });
    setFiles([]);
  };

  const submitRequest = async () => {
    // helper: format DOB to YYYY-MM-DD (accepts DD-MM-YYYY, DD/MM/YYYY, or ISO)
    const formatDOB = (value) => {
      if (!value) return null;
      // already YYYY-MM-DD
      const iso = /^\d{4}-\d{2}-\d{2}$/;
      if (iso.test(value)) return value;
      // DD-MM-YYYY or DD/MM/YYYY
      const dmy = /^(\d{2})[-\/](\d{2})[-\/](\d{4})$/;
      const m = value.match(dmy);
      if (m) {
        const [, dd, mm, yyyy] = m;
        return `${yyyy}-${mm}-${dd}`;
      }
      // try Date parse as fallback
      const parsed = new Date(value);
      if (!isNaN(parsed)) {
        const y = parsed.getFullYear();
        const mo = String(parsed.getMonth() + 1).padStart(2, "0");
        const da = String(parsed.getDate()).padStart(2, "0");
        return `${y}-${mo}-${da}`;
      }
      return null;
    };

    try {
      const token = localStorage.getItem("token");

      // validate & format DOB
      const formattedDob = formatDOB(formData.date_of_birth);
      if (!formattedDob) {
        alert('Invalid date of birth. Use DD-MM-YYYY or YYYY-MM-DD');
        return;
      }

      // map UI field names to backend expectations
      const payload = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        dob: formattedDob,
        national_id: formData.national_id,
        target_country_id: formData.target_country_id ? Number(formData.target_country_id) : null,
        benefit_type_id: formData.benefit_type_id ? Number(formData.benefit_type_id) : null,
      };

      const res = await axios.post(`/requests`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      // backend returns `request_id`.
      const requestId = res.data.request_id || res.data.id;

      if (files.length > 0) {
        const uploadData = new FormData();
        files.forEach((file) => uploadData.append("files", file));
        uploadData.append("requestId", requestId);

        await axios.post(`/documents/upload`, uploadData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
      }

      alert("Request submitted successfully!");
      window.location.href = "/requests";
    } catch (err) {
      console.error("Failed to submit request:", err);
      const serverMsg = err?.response?.data?.error || err.message || String(err);
      alert(`Failed to submit request: ${serverMsg}`);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    const loadMeta = async () => {
      try {
        const [cRes, bRes] = await Promise.all([
          axios.get('/meta/countries', { headers: token ? { Authorization: `Bearer ${token}` } : {} }),
          axios.get('/meta/benefit-types', { headers: token ? { Authorization: `Bearer ${token}` } : {} }),
        ]);
        setCountries(Array.isArray(cRes.data) ? cRes.data : []);
        setBenefits(Array.isArray(bRes.data) ? bRes.data : []);
      } catch (err) {
        console.error('Failed to load meta lists', err);
      }
    };
    loadMeta();
  }, []);



  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Page Header */}
      <Header />


      <section className="flex h-[100%] w-full flex-row">
        <Sidebar />

        <div className="h-screen w-[84%] overflow-y-auto bg-gray-200 dark:bg-gray-800 shadow-2xs pt-[130px]">
          <div className="flex items-center justify-between px-[20px]">
            <div>
              <h1 className="text-blue-400 text-3xl">New Request</h1>
              <p className="mt-1 text-gray-700">
                Create and submit a new CARICOM pension information request
              </p>
            </div>
          </div>

          <div className="mt-6 px-[20px] pb-6">
            <div className="max-w-5xl rounded-2xl border border-gray-100 bg-white shadow-sm dark:bg-gray-800 dark:border-gray-700">
              <div className="sticky top-0 z-10 rounded-t-2xl border-b border-gray-100 bg-white px-6 py-4 dark:bg-gray-800 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900">New Request</h2>
                <p className="mt-1 text-sm text-gray-500">
                  Create and submit a new CARICOM pension information request.
                </p>
              </div>

              <div className="max-h-fit overflow-y-auto px-6 py-6">
                <form className="space-y-6">
                  <section className="rounded-xl border border-gray-100 bg-gray-50 p-5 dark:bg-gray-700 dark:border-gray-600">
                    <h3 className="text-sm font-semibold text-gray-800">Claimant Information</h3>
                    <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                      <input id="first_name" value={formData.first_name} onChange={handleChange} placeholder="Enter first name" required className="mt-2 w-full rounded-md border px-3 py-2 text-sm" />
                      <input id="last_name" value={formData.last_name} onChange={handleChange} placeholder="Enter last name" required className="mt-2 w-full rounded-md border px-3 py-2 text-sm" />
                      <input id="date_of_birth" value={formData.date_of_birth} onChange={handleChange} placeholder="DD-MM-YYYY" required className="mt-2 w-full rounded-md border px-3 py-2 text-sm" />
                      <select id="sex" value={formData.sex} onChange={handleChange} required className="mt-2 w-full rounded-md border px-3 py-2 text-sm">
                        <option value="">Select...</option>
                        <option>Male</option>
                        <option>Female</option>
                      </select>
                      <input id="nis_number" value={formData.nis_number} onChange={handleChange} placeholder="Enter ID number" required className="mt-2 w-full rounded-md border px-3 py-2 text-sm" />
                      <input id="national_id" value={formData.national_id} onChange={handleChange} placeholder="Enter passport or ID number" className="mt-2 w-full rounded-md border px-3 py-2 text-sm" />
                    </div>
                  </section>

                  <section className="rounded-xl border border-gray-100 bg-gray-50 p-5 dark:bg-gray-700 dark:border-gray-600">
                    <h3 className="text-sm font-semibold text-gray-800">Request Details</h3>
                    <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                      <select id="target_country_id" value={formData.target_country_id} onChange={handleChange} required className="mt-2 w-full rounded-md border px-3 py-2 text-sm">
                        <option value="">Select country...</option>
                        {countries.map((c) => (
                          <option key={c.id} value={String(c.id)}>{c.name}</option>
                        ))}
                      </select>
                      <select id="benefit_type_id" value={formData.benefit_type_id} onChange={handleChange} required className="mt-2 w-full rounded-md border px-3 py-2 text-sm">
                        <option value="">Select benefit type...</option>
                        {benefits.map((b) => (
                          <option key={b.id} value={String(b.id)}>{b.name}</option>
                        ))}
                      </select>
                      <input id="employment_period" value={formData.employment_period} onChange={handleChange} placeholder="e.g., 1995-2005" className="mt-2 w-full rounded-md border px-3 py-2 text-sm md:col-span-2" />
                      <textarea id="additional_notes" value={formData.additional_notes} onChange={handleChange} rows="4" placeholder="Enter any additional information..." className="mt-2 w-full rounded-md border px-3 py-2 text-sm md:col-span-2" />
                    </div>
                  </section>

                  <section className="rounded-xl border border-gray-100 bg-gray-50 p-5 dark:bg-gray-700 dark:border-gray-600">
                    <h3 className="text-sm font-semibold text-gray-800">Supporting Documents</h3>
                    <div className="mt-4">
                      <input type="file" id="fileInput" multiple accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" onChange={handleFileChange} className="hidden" />
                      <button type="button" onClick={() => document.getElementById("fileInput").click()} className="w-full rounded-xl border-2 border-dashed border-gray-300 bg-white p-6 text-left transition hover:border-blue-400 hover:bg-blue-50">
                        <p className="text-sm font-medium text-gray-800">📎 Click to upload or drag and drop files here</p>
                        <p className="mt-1 text-xs text-gray-500">Supported formats: PDF, JPG, PNG, DOC (Max 10MB per file)</p>
                      </button>
                      <div className="mt-4 space-y-2">
                        {files.map((file, idx) => (
                          <p key={idx} className="text-sm text-gray-700">{file.name}</p>
                        ))}
                      </div>
                    </div>
                  </section>
                </form>
              </div>

              <div className="rounded-b-2xl border-t border-gray-100 bg-white px-6 py-4 dark:bg-gray-800 dark:border-gray-700">
                <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                  <button type="button" onClick={resetForm} className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50">Clear</button>
                  <button type="button" onClick={submitRequest} className="inline-flex items-center justify-center rounded-md bg-blue-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-200">Submit Request</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
