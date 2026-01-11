import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Header() {
  useEffect(() => {
    const id = "material-symbols-stylesheet";
    if (!document.getElementById(id)) {
      const link = document.createElement("link");
      link.id = id;
      link.href = "https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined";
      link.rel = "stylesheet";
      document.head.appendChild(link);
    }
  }, []);

  const userName = `${localStorage.getItem("first_name") || ""} ${localStorage.getItem("last_name") || ""}`.trim();
  const initials = ((localStorage.getItem("first_name") || "")[0] || "U") + ((localStorage.getItem("last_name") || "")[0] || "");

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState('');

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("first_name");
    localStorage.removeItem("last_name");
    window.location.href = "/login";
  };

  // Dark mode handling
  useEffect(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'dark') document.documentElement.classList.add('dark');
  }, []);

  const toggleTheme = () => {
    const isDark = document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  };

  return (
    <header className="fixed top-0 z-20 flex h-20 w-full items-center justify-between px-6 header-bar" style={{ backgroundColor: 'var(--header-bg)', color: 'var(--header-text)' }}>
      <div className="flex items-center gap-4">
        <img src="https://caricom.org/wp-content/uploads/CARICOM_logo_2-1280x1248.png" className="h-12 w-12 rounded" alt="CARICOM Logo" />
        <div>
          <h1 className="text-lg font-semibold text-white">CARICOM PORTAL</h1>
          <p className="text-sm text-blue-100 hidden md:block">Internal Requests Dashboard</p>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center px-4">
        <div className="relative w-full max-w-md">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-white/80">search</span>
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                const q = String(searchInput || '').trim();
                if (q.length === 0) {
                  navigate('/requests');
                } else {
                  navigate(`/requests?search=${encodeURIComponent(q)}`);
                }
              }
            }}
            className="w-full rounded-lg bg-white/20 py-2 pl-10 pr-4 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/30 dark:bg-white/12 dark:placeholder-white/60 dark:text-white"
            placeholder="Search requests or users..."
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button onClick={toggleTheme} className="rounded-full p-2 text-white hover:bg-blue-500/30" title="Toggle theme">
          <span className="material-symbols-outlined">dark_mode</span>
        </button>
        <button className="rounded-full p-2 text-white hover:bg-blue-500/30">
          <span className="material-symbols-outlined">notifications</span>
        </button>

        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((s) => !s)}
            className="flex items-center gap-2 rounded-full bg-white/10 p-2 pr-3 hover:bg-white/20 focus:outline-none"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-blue-600 font-semibold">{initials}</div>
            <div className="hidden flex-col text-left md:flex">
              <span className="text-sm font-medium text-white">{userName || 'User'}</span>
              <span className="text-xs text-white/80">Admin</span>
            </div>
            <span className="material-symbols-outlined text-white">expand_more</span>
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-2 w-48 rounded-md bg-white shadow-lg">
              <ul className="py-1">
                <li>
                  <button onClick={() => { navigate('/profile'); setMenuOpen(false); }} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Profile</button>
                </li>
                <li>
                  <button onClick={() => { navigate('/settings'); setMenuOpen(false); }} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Settings</button>
                </li>
                <li>
                  <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Logout</button>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}