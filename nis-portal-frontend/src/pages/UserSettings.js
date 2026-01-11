import { useState } from "react";
import Header from "../components/header";
import Sidebar from "../components/Sidebar";

export default function UserSettings() {
  const [emailNotif, setEmailNotif] = useState(localStorage.getItem('email_notif') === '1');
  const [compactMode, setCompactMode] = useState(localStorage.getItem('compact_mode') === '1');

  const save = () => {
    localStorage.setItem('email_notif', emailNotif ? '1' : '0');
    localStorage.setItem('compact_mode', compactMode ? '1' : '0');
    alert('Settings saved');
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
        <Header />
      <Sidebar />
      <div className="ml-0 md:ml-64">
        <main className="pt-20 p-6">
          <h2 className="mb-4 text-2xl font-semibold">User Settings</h2>
          <div className="max-w-xl">
            <label className="flex items-center gap-3 text-gray-800 dark:text-gray-200">
              <input type="checkbox" checked={emailNotif} onChange={(e) => setEmailNotif(e.target.checked)} className="accent-blue-600" />
              <span>Email notifications</span>
            </label>

            <label className="mt-4 flex items-center gap-3 text-gray-800 dark:text-gray-200">
              <input type="checkbox" checked={compactMode} onChange={(e) => setCompactMode(e.target.checked)} className="accent-blue-600" />
              <span>Compact layout</span>
            </label>

            <div className="mt-6">
              <button onClick={save} className="rounded bg-blue-600 px-4 py-2 text-white">Save Settings</button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
