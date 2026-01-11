import { useState } from "react";
import Header from "../components/header";
import axios from "axios";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("/auth/login", {
        email,
        password,
      });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("first_name", res.data['user']['first_name']);
      localStorage.setItem("last_name", res.data['user']['last_name']);
      if (res.data['user']['id']) localStorage.setItem('user_id', res.data['user']['id']);
      if (res.data['user']['email']) localStorage.setItem('email', res.data['user']['email']);
      console.log(res.data['user'])
      window.location.href = "/dashboard"; 
    } catch (err) {
      alert("Login failed: " + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-no-repeat bg-cover bg-[url('https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fcaricom.org%2Fwp-content%2Fuploads%2FCARICOM-Headquarters-2019.jpg&f=1&nofb=1&ipt=7a7c5df67ceb40ecf576cf0e28464d7aa43b9b9808fd87fbf1d38789da60ebb6')] ">

      {/* Main content */}
      <main className="flex min-h-screen items-center justify-center px-4 pt-[120px] pb-10">
        <div className="w-full max-w-5xl">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Left info panel */}
            <div className="hidden lg:block">
              <div className="rounded-2xl bg-blue-500 p-8 text-white shadow-sm">
                <h2 className="text-2xl font-semibold">Sign in to CARICOM Portal</h2>
                <p className="mt-2 text-sm text-white/90">
                  Manage pension requests, upload documents, and track statuses in one place.
                </p>
                <div className="mt-6 space-y-4">
                  <div className="rounded-xl bg-white/10 p-4">
                    <p className="text-sm font-semibold">Fast request tracking</p>
                    <p className="mt-1 text-sm text-white/85">
                      See what’s pending, responded, closed, or overdue.
                    </p>
                  </div>
                  <div className="rounded-xl bg-white/10 p-4">
                    <p className="text-sm font-semibold">Secure documents</p>
                    <p className="mt-1 text-sm text-white/85">
                      Upload PDFs/IDs and keep a clear record of changes.
                    </p>
                  </div>
                  <div className="rounded-xl bg-white/10 p-4">
                    <p className="text-sm font-semibold">Built for CARICOM workflow</p>
                    <p className="mt-1 text-sm text-white/85">
                      Standard fields so agencies can process requests easier.
                    </p>
                  </div>
                </div>
                <p className="mt-6 text-xs text-white/75">
                  If you don’t have an account, you’ll need an admin to create one for you.
                </p>
              </div>
            </div>

            {/* Right login form */}
            <div>
              <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8 dark:bg-gray-800 dark:border-gray-700">
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Login</h2>
                  <p className="mt-1 text-sm text-gray-600">
                    Enter your email and password to continue.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Email</label>
                    <input
                      type="email"
                      required
                      placeholder="name@agency.org"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="mt-2 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">Password</label>
                    <input
                      type="password"
                      required
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="mt-2 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    />
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <label className="inline-flex items-center gap-2 text-sm text-gray-600">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-200"
                      />
                      Remember me
                    </label>
                    <a href="/help" className="text-sm font-medium text-blue-600 hover:underline">
                      Forgot password?
                    </a>
                  </div>

                  <button
                    type="submit"
                    className="mt-2 inline-flex w-full items-center justify-center rounded-md bg-blue-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  >
                    Sign In
                  </button>

                  <div className="relative py-2">
                    <div className="h-px w-full bg-gray-100"></div>
                    <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-3 text-xs text-gray-400">
                      OR
                    </span>
                  </div>

                  <a
                    href="/register"
                    className="mt-2 inline-flex w-full items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-blue-600 transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  >
                    Create an Account
                  </a>

                  <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 dark:bg-gray-700 dark:border-gray-600">
                    <p className="text-sm font-semibold text-gray-900">Need help?</p>
                    <p className="mt-1 text-sm text-gray-700">
                      Email{" "}
                      <a href="mailto:support@nis.gov.gy" className="font-medium text-blue-600 hover:underline">
                        support@nis.gov.gy
                      </a>{" "}
                      or call <span className="font-medium">+592-226-8628</span>.
                    </p>
                  </div>

                  <p className="text-xs text-gray-500">
                    By signing in, you agree to the portal rules and your organization’s policies.
                  </p>
                </form>
              </div>

              <div className="mt-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm lg:hidden dark:bg-gray-800 dark:border-gray-700">
                <p className="text-sm font-semibold text-gray-900">CARICOM Portal</p>
                <p className="mt-1 text-sm text-gray-600">
                  Manage requests, upload docs, and track status updates safely.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
