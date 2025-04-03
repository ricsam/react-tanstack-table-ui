import { Link, Outlet } from '@tanstack/react-router';
import { useTheme } from "@/contexts/use_theme";
import logoFullDark from '@/assets/logos/logo-full-dark.svg';
import logoFullLight from '@/assets/logos/logo-full-light.svg';
import logoIconDark from '@/assets/logos/logo-icon-dark.svg';
import logoIconLight from '@/assets/logos/logo-icon-light.svg';
import { useState, useEffect } from 'react';

export function RootLayout() {
  const { theme, toggleTheme } = useTheme();
  const logoFull = theme === 'light' ? logoFullLight : logoFullDark;
  const logoIcon = theme === 'light' ? logoIconLight : logoIconDark;
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Handle responsive behavior
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className="min-h-screen flex bg-white dark:bg-gray-900">
      {/* Sidebar */}
      <aside 
        className={`${sidebarOpen ? 'w-64' : 'w-16'} h-screen sticky top-0 flex-shrink-0 border-r border-gray-200 dark:border-gray-700 flex flex-col transition-all duration-200 ease-in-out ${isMobile ? (sidebarOpen ? 'translate-x-0' : '-translate-x-full') : ''}`}
      >
        <div className="flex-shrink-0 p-4 flex items-center justify-between">
          <Link to="/" className="flex items-center">
            {sidebarOpen ? (
              <img src={logoFull} alt="React TanStack Table UI" className="h-8" />
            ) : (
              <img src={logoIcon} alt="React TanStack Table UI" className="h-8 w-8" />
            )}
          </Link>
          {!isMobile && (
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              aria-label="Toggle sidebar"
            >
              {sidebarOpen ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                </svg>
              )}
            </button>
          )}
        </div>
        <nav className={`flex-1 px-2 py-4 ${sidebarOpen ? 'space-y-1' : 'space-y-4'} overflow-y-auto`}>
          {/* Getting Started - only show text if sidebar is open */}
          {sidebarOpen && (
            <div className="space-y-1">
              <h3 className="px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Getting Started
              </h3>
              <Link
                to="/docs/getting-started"
                className="flex items-center px-4 py-2 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
                activeProps={{
                  className: "bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300",
                }}
              >
                Introduction
              </Link>
              <Link
                to="/docs/installation"
                className="flex items-center px-4 py-2 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
                activeProps={{
                  className: "bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300",
                }}
              >
                Installation
              </Link>
              <Link
                to="/docs/quickstart"
                className="flex items-center px-4 py-2 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
                activeProps={{
                  className: "bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300",
                }}
              >
                Quick Start
              </Link>
            </div>
          )}

          {/* Icons-only view when collapsed */}
          {!sidebarOpen && (
            <div className="flex flex-col items-center space-y-4">
              <Link
                to="/docs/getting-started"
                className="p-2 rounded-md text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
                activeProps={{
                  className: "bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300",
                }}
                title="Introduction"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </Link>
              <Link
                to="/examples/basic"
                className="p-2 rounded-md text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
                activeProps={{
                  className: "bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300",
                }}
                title="Examples"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </Link>
              <Link
                to="/api"
                className="p-2 rounded-md text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
                activeProps={{
                  className: "bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300",
                }}
                title="API Reference"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </Link>
            </div>
          )}

          {/* Core Concepts and other sections - only show if sidebar is open */}
          {sidebarOpen && (
            <>
              <div className="space-y-1">
                <h3 className="px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Core Concepts
                </h3>
                <Link
                  to="/examples/skins"
                  className="flex items-center px-4 py-2 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
                  activeProps={{
                    className: "bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300",
                  }}
                >
                  Skins
                </Link>
                <Link
                  to="/examples/virtual"
                  className="flex items-center px-4 py-2 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
                  activeProps={{
                    className: "bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300",
                  }}
                >
                  Virtualization
                </Link>
                <Link
                  to="/examples/customization"
                  className="flex items-center px-4 py-2 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
                  activeProps={{
                    className: "bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300",
                  }}
                >
                  Drag and Drop
                </Link>
              </div>

              <div className="space-y-1">
                <h3 className="px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Examples
                </h3>
                <Link
                  to="/examples/basic"
                  className="flex items-center px-4 py-2 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
                  activeProps={{
                    className: "bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300",
                  }}
                >
                  Basic Table
                </Link>
                <Link
                  to="/examples/skins"
                  className="flex items-center px-4 py-2 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
                  activeProps={{
                    className: "bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300",
                  }}
                >
                  Skins Example
                </Link>
                <Link
                  to="/examples/filtering"
                  className="flex items-center px-4 py-2 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
                  activeProps={{
                    className: "bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300",
                  }}
                >
                  Filtering
                </Link>
              </div>

              <div className="space-y-1">
                <h3 className="px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  API Reference
                </h3>
                <Link
                  to="/api"
                  className="flex items-center px-4 py-2 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
                  activeProps={{
                    className: "bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300",
                  }}
                >
                  API Reference
                </Link>
              </div>
            </>
          )}
        </nav>
        <div className={`flex-shrink-0 p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 ${!sidebarOpen && 'justify-center'}`}>
          <div className="flex items-center justify-between">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              aria-label="Toggle dark mode"
            >
              {theme === 'light' ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              )}
            </button>
            {sidebarOpen && (
              <a
                href="https://github.com/ricsam/react-tanstack-table-ui"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.91-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
              </a>
            )}
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar Toggle Button */}
      {isMobile && (
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="fixed bottom-4 right-4 z-50 p-3 rounded-full bg-primary-600 text-white shadow-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          aria-label="Toggle sidebar"
        >
          {sidebarOpen ? (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
        <footer className="border-t border-gray-200 dark:border-gray-700 py-4">
          <div className="px-4">
            <p className="text-center text-gray-500 dark:text-gray-400 text-sm">
              &copy; {new Date().getFullYear()} React TanStack Table UI. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
} 