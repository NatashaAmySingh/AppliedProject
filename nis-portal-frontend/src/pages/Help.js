import React from "react";
import Header from "../components/header";
import Sidebar from "../components/Sidebar";

export default function Help() {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Page Header */}
      <Header />


      <section className="flex h-[100%] w-full flex-row">
        <Sidebar />

        <div className="h-screen w-[84%] overflow-y-auto bg-gray-200 dark:bg-gray-800 shadow-2xs pt-[130px]">
          {/* Help View (Tailwind, responsive, matches your new styling) */}
          <div id="helpView" className="px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
            {/* Header */}
            <div className="mb-5">
              <h2 className="text-2xl font-semibold text-gray-900">Help &amp; Support</h2>
              <p className="mt-1 text-sm text-gray-600">Resources and documentation for using the CARICOM Portal</p>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              {/* FAQ */}
              <div className="lg:col-span-2 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5 dark:bg-gray-800 dark:border-gray-700">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-900">Frequently Asked Questions</h3>
                </div>

                <div className="space-y-3">
                  {/* FAQ Item */}
                  <details className="group rounded-xl border border-gray-100 bg-gray-50 p-4">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-3">
                      <span className="text-sm font-semibold text-blue-600">How do I create a new request?</span>
                      <span className="text-gray-500 transition group-open:rotate-180">▾</span>
                    </summary>
                    <p className="mt-3 text-sm text-gray-700">
                      Click the <span className="font-medium">New Request</span> option from the sidebar (or the dashboard shortcut). Fill in claimant information, select the target country, and attach required documents before submitting.
                    </p>
                  </details>

                  <details className="group rounded-xl border border-gray-100 bg-gray-50 p-4">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-3">
                      <span className="text-sm font-semibold text-blue-600">What documents should I attach?</span>
                      <span className="text-gray-500 transition group-open:rotate-180">▾</span>
                    </summary>
                    <p className="mt-3 text-sm text-gray-700">
                      Typically: claimant application form, copy of national ID or passport, and signed consent form. Additional documents may be needed depending on the benefit type.
                    </p>
                  </details>

                  <details className="group rounded-xl border border-gray-100 bg-gray-50 p-4">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-3">
                      <span className="text-sm font-semibold text-blue-600">How long does a typical request take?</span>
                      <span className="text-gray-500 transition group-open:rotate-180">▾</span>
                    </summary>
                    <p className="mt-3 text-sm text-gray-700">
                      The target response time is <span className="font-medium">30 days</span>. You can track status in real time through the portal. Overdue requests are automatically flagged.
                    </p>
                  </details>

                  <details className="group rounded-xl border border-gray-100 bg-gray-50 p-4">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-3">
                      <span className="text-sm font-semibold text-blue-600">Who can I contact for support?</span>
                      <span className="text-gray-500 transition group-open:rotate-180">▾</span>
                    </summary>
                    <div className="mt-3 space-y-1 text-sm text-gray-700">
                      <p>
                        <span className="font-medium">Technical issues:</span>
                        <a href="mailto:support@nis.gov.gy"
                          className="text-blue-600 hover:underline">support@nis.gov.gy</a>
                      </p>
                      <p>
                        <span className="font-medium">CARICOM process questions:</span>
                        <a href="mailto:caricom@nis.gov.gy"
                          className="text-blue-600 hover:underline">caricom@nis.gov.gy</a>
                      </p>
                      <p><span className="font-medium">Phone:</span> +592-226-8628</p>
                    </div>
                  </details>
                </div>
              </div>

              {/* Quick Links */}
              <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5 dark:bg-gray-800 dark:border-gray-700">
                <h3 className="text-sm font-semibold text-gray-900">Quick Links</h3>

                <ul className="mt-4 divide-y divide-gray-100 rounded-xl border border-gray-100 bg-gray-50 dark:bg-gray-700 dark:border-gray-700">
                  <li className="p-4">
                    <a href="/help" className="text-sm font-medium text-blue-600 hover:underline">📖 User Manual (PDF)</a>
                    <p className="mt-1 text-xs text-gray-500">Download the full portal user guide.</p>
                  </li>
                  <li className="p-4">
                    <a href="/help" className="text-sm font-medium text-blue-600 hover:underline">📹 Video Tutorial: Creating Your First Request</a>
                    <p className="mt-1 text-xs text-gray-500">Step-by-step walkthrough for new users.</p>
                  </li>
                  <li className="p-4">
                    <a href="/help" className="text-sm font-medium text-blue-600 hover:underline">📄 CARICOM Agreement Documentation</a>
                    <p className="mt-1 text-xs text-gray-500">Reference material and policy documentation.</p>
                  </li>
                  <li className="p-4">
                    <a href="/help" className="text-sm font-medium text-blue-600 hover:underline">🔒 Security Best Practices</a>
                    <p className="mt-1 text-xs text-gray-500">Guidelines for safe account and data usage.</p>
                  </li>
                </ul>

                {/* Optional: Support CTA */}
                <div className="mt-5 rounded-xl border border-blue-100 bg-blue-50 p-4">
                  <p className="text-sm font-medium text-gray-900">Need help right now?</p>
                  <p className="mt-1 text-sm text-gray-700">Email support and include your Request ID (if applicable).</p>
                  <a href="mailto:support@nis.gov.gy"
                    className="mt-3 inline-flex w-full items-center justify-center rounded-md bg-blue-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-200">
                    Contact Support
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
