"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Cog6ToothIcon, XCircleIcon } from "@heroicons/react/24/outline";

interface Config {
  playwrightServerEndpoint: string;
  playwrightMcpEndpoint: string;
}

export default function AdminPage() {
  const router = useRouter();
  const [config, setConfig] = useState<Config | null>(null);
  const [loading, setLoading] = useState(true);
  const [configError, setConfigError] = useState(false);
  const [showQuitConfirm, setShowQuitConfirm] = useState(false);

  useEffect(() => {
    fetch("/api/config")
      .then((res) => res.json())
      .then((data) => {
        setConfig(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load configuration:", err);
        setConfigError(true);
        setLoading(false);
      });
  }, []);

  const handleQuit = () => {
    setShowQuitConfirm(false);
    router.push("/");
  };

  return (
    <div className="min-h-screen overflow-y-auto">
      <div className="py-8 px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Cog6ToothIcon className="h-8 w-8 text-gray-700" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Administrator
                </h1>
                <p className="text-gray-600 mt-1">
                  Manage and monitor application services
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowQuitConfirm(true)}
              className="flex items-center gap-2 px-5 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
            >
              <XCircleIcon className="h-5 w-5" />
              Quit
            </button>
          </div>

          {/* Configuration Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Service Configuration
            </h2>
            {loading ? (
              <div className="flex items-center gap-3 text-gray-500">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-500"></div>
                <span>Loading configuration...</span>
              </div>
            ) : config ? (
              <dl className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                  <dt className="text-sm font-medium text-gray-500 sm:w-56">
                    Playwright Server Endpoint
                  </dt>
                  <dd className="text-sm text-gray-900 font-mono bg-gray-50 px-3 py-1.5 rounded border border-gray-200">
                    {config.playwrightServerEndpoint}
                  </dd>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                  <dt className="text-sm font-medium text-gray-500 sm:w-56">
                    Playwright MCP Endpoint
                  </dt>
                  <dd className="text-sm text-gray-900 font-mono bg-gray-50 px-3 py-1.5 rounded border border-gray-200">
                    {config.playwrightMcpEndpoint}
                  </dd>
                </div>
              </dl>
            ) : configError ? (
              <p className="text-sm text-red-600">
                Failed to load configuration.
              </p>
            ) : null}
          </div>

          {/* Status Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Application Status
            </h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="h-2.5 w-2.5 rounded-full bg-green-500"></span>
                <span className="text-sm text-gray-700">Web Application</span>
                <span className="text-xs text-gray-400 ml-auto">Running</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="h-2.5 w-2.5 rounded-full bg-gray-300"></span>
                <span className="text-sm text-gray-700">
                  Playwright Browser Server
                </span>
                <span className="text-xs text-gray-400 ml-auto">External</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="h-2.5 w-2.5 rounded-full bg-gray-300"></span>
                <span className="text-sm text-gray-700">
                  Playwright MCP Server
                </span>
                <span className="text-xs text-gray-400 ml-auto">External</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quit Confirmation Modal */}
      {showQuitConfirm && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Confirm Quit
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to quit the administrator panel?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowQuitConfirm(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleQuit}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
              >
                Quit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
