import { Link } from '@tanstack/react-router';
import { useTheme } from '@/contexts/ThemeContext';
import logoFullDark from '@/assets/logos/logo-full-dark.svg';
import logoFullLight from '@/assets/logos/logo-full-light.svg';
import logoIconDark from '@/assets/logos/logo-icon-dark.svg';
import logoIconLight from '@/assets/logos/logo-icon-light.svg';

export function HomePage() {
  const { theme } = useTheme();
  const logoFull = theme === "light" ? logoFullLight : logoFullDark;
  const logoIcon = theme === "light" ? logoIconLight : logoIconDark;

  return (
    <div>
      <div className="bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center mb-8">
              <img src={logoFull} alt="React TanStack Table UI" className="h-16" />
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-5xl md:text-6xl">
              <span className="block">React TanStack Table UI</span>
              <span className="block text-primary-600">Powerful virtualized tables for React</span>
            </h1>
            <p className="mt-3 max-w-md mx-auto text-base text-gray-500 dark:text-gray-400 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
              A collection of components and utilities for building powerful, customizable tables with TanStack Table and virtual scrolling support.
            </p>
            <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
              <div className="rounded-md shadow">
                <Link
                  to="/docs/getting-started"
                  className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 dark:text-white dark:bg-primary-600 dark:hover:bg-primary-700 md:py-4 md:text-lg md:px-10"
                >
                  Get started
                </Link>
              </div>
              <div className="mt-3 rounded-md shadow sm:mt-0 sm:ml-3">
                <a
                  href="https://github.com/ricsam/virtualized-table"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center px-8 py-3 border border-gray-300 dark:border-gray-600 text-base font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 md:py-4 md:text-lg md:px-10"
                >
                  GitHub
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="py-12 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-primary-600 font-semibold tracking-wide uppercase">Features</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              Everything you need for complex tables
            </p>
          </div>

          <div className="mt-10">
            <dl className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
              <div className="relative">
                <dt>
                  <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white">
                    🚀
                  </div>
                  <p className="ml-16 text-lg leading-6 font-medium text-gray-900 dark:text-white">TanStack Table Integration</p>
                </dt>
                <dd className="mt-2 ml-16 text-base text-gray-500 dark:text-gray-400">
                  Built on top of TanStack Table v8 (formerly React Table) for powerful table functionality.
                </dd>
              </div>

              <div className="relative">
                <dt>
                  <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white">
                    📜
                  </div>
                  <p className="ml-16 text-lg leading-6 font-medium text-gray-900 dark:text-white">Virtual Scrolling</p>
                </dt>
                <dd className="mt-2 ml-16 text-base text-gray-500 dark:text-gray-400">
                  Handle large datasets efficiently with TanStack Virtual for smooth scrolling performance.
                </dd>
              </div>

              <div className="relative">
                <dt>
                  <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white">
                    🎨
                  </div>
                  <p className="ml-16 text-lg leading-6 font-medium text-gray-900 dark:text-white">Multiple Skins</p>
                </dt>
                <dd className="mt-2 ml-16 text-base text-gray-500 dark:text-gray-400">
                  Choose from pre-built Material UI or Anocca themes, or create your own custom skin.
                </dd>
              </div>

              <div className="relative">
                <dt>
                  <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white">
                    🔌
                  </div>
                  <p className="ml-16 text-lg leading-6 font-medium text-gray-900 dark:text-white">Extensible Architecture</p>
                </dt>
                <dd className="mt-2 ml-16 text-base text-gray-500 dark:text-gray-400">
                  Customizable and extensible architecture for adapting to your specific needs.
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
} 