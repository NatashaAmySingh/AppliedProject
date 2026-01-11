import { useEffect, useState } from "react";
import axios from "axios";
import Header from "../components/header";
import Sidebar from "../components/Sidebar";

export default function Profile() {
  const [user, setUser] = useState({ first_name: "", last_name: "", email: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const id = localStorage.getItem("user_id");
    const email = localStorage.getItem("email");
    const first = localStorage.getItem("first_name");
    const last = localStorage.getItem("last_name");
    if (id) {
      axios
        .get(`/users`)
        .then((res) => {
          const found = Array.isArray(res.data) ? res.data.find((u) => String(u.id) === String(id)) : null;
          if (found) setUser({ first_name: found.first_name || first || "", last_name: found.last_name || last || "", email: found.email || email || "" });
          else setUser({ first_name: first || "", last_name: last || "", email: email || "" });
        })
        .catch(() => setUser({ first_name: first || "", last_name: last || "", email: email || "" }))
        .finally(() => setLoading(false));
    } else {
      setUser({ first_name: first || "", last_name: last || "", email: email || "" });
      setLoading(false);
    }
  }, []);

  const save = async () => {
    const id = localStorage.getItem("user_id");
    if (!id) return alert("No user id available");
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      await axios.patch(`/users/${id}`, user, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
      alert("Profile saved.");
    } catch (err) {
      console.error(err);
      alert("Failed to save: " + (err.response?.data?.error || err.message));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <Header />
      <Sidebar />
      <div className="ml-0 ml-64">
        <main className="pt-20 p-6">Loading...</main>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <Header />
      <Sidebar />
      <div className="ml-0 ml-64">
        <main className="pt-20 p-6">
          <h2 className="mb-4 text-2xl font-semibold text-gray-800 dark:text-gray-100">My Profile</h2>
          <div className="max-w-xl rounded-xl border border-gray-100 bg-white p-6 dark:bg-gray-800 dark:border-gray-700">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">First name</label>
            <input value={user.first_name} onChange={(e) => setUser({ ...user, first_name: e.target.value })} className="mt-1 w-full rounded-md border px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200" />

            <label className="mt-4 block text-sm font-medium text-gray-700 dark:text-gray-200">Last name</label>
            <input value={user.last_name} onChange={(e) => setUser({ ...user, last_name: e.target.value })} className="mt-1 w-full rounded-md border px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200" />

            <label className="mt-4 block text-sm font-medium text-gray-700 dark:text-gray-200">Email</label>
            <input value={user.email} onChange={(e) => setUser({ ...user, email: e.target.value })} className="mt-1 w-full rounded-md border px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200" />

            <div className="mt-6 flex gap-2">
              <button onClick={save} disabled={saving} className="rounded bg-blue-600 px-4 py-2 text-white">
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
