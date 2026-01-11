import React from "react";
import { useState } from "react";
import axios from "axios";
import Header from "../components/header";

export default function Register() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const base = process.env.REACT_APP_API_URL || '';
      const res = await axios.post(`${base}/auth/register`, {
        first_name: firstName,
        last_name: lastName,
        email,
        password,
      });

      alert("Registration successful!");
      window.location.href = "/login"; 
    } catch (err) {
      alert("Registration failed: " + (err.response?.data?.message || err.response?.data?.error || err.message));
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">

      {/* Main */}
      <main className="flex min-h-screen items-center justify-center px-4 pt-[120px] pb-10">
        <div className="w-full max-w-xl">
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8 dark:bg-gray-800 dark:border-gray-700">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Create Account</h2>
              <p className="mt-1 text-sm text-gray-600">Register a new CARICOM Portal account.</p>
            </div>

            <form id="registerForm" className="space-y-4" onSubmit={handleRegister}>
              {/* Full name */}
              <div>
                <label className="text-sm font-medium text-gray-700">First Name</label>
                <input
                  type="text"
                  placeholder="First Name"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Last Name</label>
                <input
                  type="text"
                  placeholder="Last Name"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />
              </div>

              {/* Email */}
              <div>
                <label className="text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  required
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />
              </div>

              {/* Password */}
              <div>
                <label className="text-sm font-medium text-gray-700">Password</label>
                <input
                  type="password"
                  required
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="mt-2 inline-flex w-full items-center justify-center rounded-md bg-blue-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-600 focus:ring-2 focus:ring-blue-200"
              >
                Register
              </button>

              <p className="text-xs text-gray-500">
                Already have an account?{' '}
                <a href="/login" className="text-blue-600 hover:underline">
                  Sign in
                </a>
              </p>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
