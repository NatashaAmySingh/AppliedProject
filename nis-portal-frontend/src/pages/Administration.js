import React, { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import Header from "../components/header";

export default function Administration() {
  const [users, setUsers] = useState([]);
  const [settings, setSettings] = useState({
    passwordLength: 8,
    sessionTimeout: 30,
    responseThreshold: 30,
    whatsappNotifications: "Yes",
  });
  const [logs, setLogs] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newUser, setNewUser] = useState({ first_name: '', last_name: '', email: '', password: '', role: '' });
  const [editingUser, setEditingUser] = useState(null);
  const [editRole, setEditRole] = useState('');

  useEffect(() => {
    const token = localStorage.getItem("token");

    // restrict page to admins
    const role = localStorage.getItem('role');
    if (role !== '1') {
      window.location.href = '/dashboard';
      return;
    }

    axios
      .get("/users", { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => setUsers(res.data))
      .catch((err) => console.error("Failed to load users:", err));

    axios
      .get("/audit", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setLogs(res.data))
      .catch((err) => console.error("Failed to load logs:", err));
  }, []);

  const reloadUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/users', { headers: { Authorization: `Bearer ${token}` } });
      setUsers(res.data);
    } catch (err) {
      console.error('Failed to reload users:', err);
    }
  };

  const addUser = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post('/users', newUser, { headers: { Authorization: `Bearer ${token}` } });
      setShowAdd(false);
      setNewUser({ first_name: '', last_name: '', email: '', password: '', role: '' });
      await reloadUsers();
    } catch (err) {
      console.error('Failed to add user:', err);
      alert('Failed to add user');
    }
  };

  const saveEdit = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`/users/${id}`, { role: editRole }, { headers: { Authorization: `Bearer ${token}` } });
      setEditingUser(null);
      await reloadUsers();
    } catch (err) {
      console.error('Failed to update user:', err);
      alert('Failed to update user');
    }
  };

  const saveSettings = () => {
    alert("Settings saved locally (no backend endpoint defined).");
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <Header />

      <section className="flex h-[100%] w-full flex-row">
        <Sidebar />

        <div className="h-screen w-[84%] overflow-y-auto bg-gray-200 dark:bg-gray-800 shadow-2xs pt-[130px]">
          <div className="flex items-center justify-between px-[20px]">
            <div>
              <h1 className="text-blue-400 text-3xl">Administration</h1>
              <p className="mt-1 text-gray-700">Manage users and system settings</p>
            </div>
          </div>

          <div id="adminView" className="px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
            {/* User Management */}
            <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5 dark:bg-gray-800 dark:border-gray-700">
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h3 className="text-sm font-semibold text-gray-900">
                  User Management
                </h3>
                <button
                  type="button"
                  onClick={() => setShowAdd(true)}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-blue-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-200 sm:w-auto"
                >
                  <span aria-hidden="true">➕</span>
                  Add New User
                </button>
              </div>

              {showAdd && (
                <div className="mb-4 rounded-md border border-gray-200 bg-gray-50 p-4">
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                    <input placeholder="First name" value={newUser.first_name} onChange={(e)=>setNewUser({...newUser, first_name: e.target.value})} className="rounded-md border px-3 py-2" />
                    <input placeholder="Last name" value={newUser.last_name} onChange={(e)=>setNewUser({...newUser, last_name: e.target.value})} className="rounded-md border px-3 py-2" />
                    <input placeholder="Email" value={newUser.email} onChange={(e)=>setNewUser({...newUser, email: e.target.value})} className="rounded-md border px-3 py-2" />
                    <input placeholder="Password" type="password" value={newUser.password} onChange={(e)=>setNewUser({...newUser, password: e.target.value})} className="rounded-md border px-3 py-2" />
                    <input placeholder="Role (id)" value={newUser.role} onChange={(e)=>setNewUser({...newUser, role: e.target.value})} className="rounded-md border px-3 py-2" />
                    <div className="flex gap-2">
                      <button onClick={addUser} className="rounded-md bg-green-500 px-3 py-2 text-white">Create</button>
                      <button onClick={()=>setShowAdd(false)} className="rounded-md bg-gray-200 px-3 py-2">Cancel</button>
                    </div>
                  </div>
                </div>
              )}

                <div className="-mx-4 overflow-x-auto sm:mx-0">
                <div className="min-w-[860px] overflow-hidden rounded-xl border border-gray-100 dark:border-gray-700">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 text-xs font-semibold text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                      <tr>
                        <th className="px-4 py-3">Name</th>
                        <th className="px-4 py-3">Email</th>
                        <th className="px-4 py-3">Role</th>
                        <th className="px-4 py-3">Organization</th>
                        <th className="px-4 py-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="text-gray-700 dark:text-gray-200">
                      {users.map((u) => (
                        <tr
                          key={u.id}
                          className="border-t border-gray-100 bg-gray-50 hover:bg-gray-100 dark:bg-transparent dark:border-gray-700 dark:hover:bg-gray-800"
                        >
                          <td className="px-4 py-3">{u.name}</td>
                          <td className="px-4 py-3">{u.email}</td>
                          <td className="px-4 py-3">{u.role ?? '-'}</td>
                          <td className="px-4 py-3">{u.organization ?? '-'}</td>
                          <td className="px-4 py-3">
                            {editingUser === u.id ? (
                              <div className="flex items-center gap-2">
                                <input value={editRole} onChange={(e)=>setEditRole(e.target.value)} placeholder="role id" className="rounded-md border px-2 py-1 text-xs" />
                                <button onClick={()=>saveEdit(u.id)} className="rounded-md bg-green-500 px-3 py-1 text-white text-xs">Save</button>
                                <button onClick={()=>setEditingUser(null)} className="rounded-md bg-gray-200 px-3 py-1 text-xs">Cancel</button>
                              </div>
                            ) : (
                              <div className="flex gap-2">
                                <button onClick={()=>{ setEditingUser(u.id); setEditRole(u.role); }} type="button" className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-gray-50">Edit</button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* System Settings */}
            <div className="mt-6 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
              <h3 className="text-sm font-semibold text-gray-900">System Settings</h3>
              <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Password Policy - Minimum Length
                  </label>
                  <input
                    type="number"
                    value={settings.passwordLength}
                    onChange={(e) =>
                      setSettings({ ...settings, passwordLength: e.target.value })
                    }
                    className="mt-2 w-full rounded-md border px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Session Timeout (minutes)
                  </label>
                  <input
                    type="number"
                    value={settings.sessionTimeout}
                    onChange={(e) =>
                      setSettings({ ...settings, sessionTimeout: e.target.value })
                    }
                    className="mt-2 w-full rounded-md border px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Response Time Threshold (days)
                  </label>
                  <input
                    type="number"
                    value={settings.responseThreshold}
                    onChange={(e) =>
                      setSettings({ ...settings, responseThreshold: e.target.value })
                    }
                    className="mt-2 w-full rounded-md border px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Enable WhatsApp Notifications
                  </label>
                  <select
                    value={settings.whatsappNotifications}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        whatsappNotifications: e.target.value,
                      })
                    }
                    className="mt-2 w-full rounded-md border px-3 py-2 text-sm"
                  >
                    <option>Yes</option>
                    <option>No</option>
                  </select>
                </div>
              </div>
              <div className="mt-5 flex justify-end">
                <button
                  type="button"
                  onClick={saveSettings}
                  className="inline-flex w-full items-center justify-center rounded-md bg-blue-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-600 sm:w-auto"
                >
                  Save Settings
                </button>
              </div>
            </div>

            {/* Audit Logs */}
            <div className="mt-6 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
              <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <h3 className="text-sm font-semibold text-gray-900">Audit Logs</h3>
                <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 lg:w-auto lg:grid-cols-3">
                  <input
                    type="text"
                    placeholder="Search logs..."
                    className="w-full rounded-md border px-3 py-2 text-sm"
                  />
                  <input type="date" className="w-full rounded-md border px-3 py-2 text-sm" />
                  <select className="w-full rounded-md border px-3 py-2 text-sm">
                    <option>All Actions</option>
                    <option>Login</option>
                    <option>Document Access</option>
                    <option>Request Created</option>
                  </select>
                </div>
              </div>

              {/* Table: horizontal scroll on small screens */}
              <div className="-mx-4 overflow-x-auto sm:mx-0">
                <div className="min-w-[900px] overflow-hidden rounded-xl border border-gray-100">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 text-xs font-semibold text-gray-600">
                      <tr>
                        <th className="px-4 py-3">Timestamp</th>
                        <th className="px-4 py-3">User</th>
                        <th className="px-4 py-3">Action</th>
                        <th className="px-4 py-3">Details</th>
                      </tr>
                    </thead>
                    <tbody className="text-gray-700">
                      {logs.map((log, idx) => (
                        <tr
                          key={idx}
                          className={`border-t border-gray-100 ${
                            idx % 2 === 0 ? "bg-gray-50" : "bg-white"
                          }`}
                        >
                          <td className="px-4 py-3 whitespace-nowrap">
                            {log.timestamp}
                          </td>
                          <td className="px-4 py-3">{log.user}</td>
                          <td className="px-4 py-3">{log.action}</td>
                          <td className="px-4 py-3 text-gray-600">{log.details}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
