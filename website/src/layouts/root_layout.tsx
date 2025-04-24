import logoFullDark from "@/assets/logos/logo-full-dark.svg";
import logoFullLight from "@/assets/logos/logo-full-light.svg";
import logoIconDark from "@/assets/logos/logo-icon-dark.svg";
import logoIconLight from "@/assets/logos/logo-icon-light.svg";
import { SidebarSection } from "@/components/sidebar/sidebar_section";
import { useTheme } from "@/contexts/use_theme";
import { navigation } from "@/data/navigation";
import { Toc, TocEntry } from "@stefanprobst/rehype-extract-toc";
import { Link, Outlet, useMatches } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { useCallback, useEffect, useRef, useState } from "react";

// TableOfContents component
const TableOfContents = ({
  toc,
  sidebarOpen,
}: {
  toc: Toc;
  sidebarOpen: boolean;
}) => {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const tocContainerRef = useRef<HTMLDivElement>(null);
  const activeItemRef = useRef<string | null>(null);

  // Check if we have any valid TOC items with IDs
  const hasValidItems = toc.some(
    (item) =>
      Boolean(item.id) ||
      (item.children && item.children.some((child) => Boolean(child.id))),
  );

  // Helper function to find the first item with an ID
  const findFirstItemWithId = useCallback(
    (items: TocEntry[]): string | null => {
      for (const item of items) {
        if (item.id) return item.id;
        if (item.children && item.children.length > 0) {
          const childId = findFirstItemWithId(item.children);
          if (childId) return childId;
        }
      }
      return null;
    },
    [],
  );

  // Check window size
  useEffect(() => {
    const checkSize = () => {
      setIsVisible(window.innerWidth >= (sidebarOpen ? 1280 : 1280));
    };

    checkSize();
    window.addEventListener("resize", checkSize);
    return () => window.removeEventListener("resize", checkSize);
  }, [sidebarOpen]);

  // Get all headers that should be observed
  const getHeaderElements = useCallback(() => {
    return document.querySelectorAll(
      "h1[id], h2[id], h3[id], h4[id], h5[id], h6[id]",
    );
  }, []);

  // Find all TOC IDs for tracking
  const getAllIds = useCallback((entries: TocEntry[]): string[] => {
    let ids: string[] = [];

    entries.forEach((entry) => {
      if (entry.id) ids.push(entry.id);
      if (entry.children && entry.children.length > 0) {
        ids = [...ids, ...getAllIds(entry.children)];
      }
    });

    return ids;
  }, []);

  const disableScrollRef = useRef(false);

  // Scroll active TOC item into view when activeId changes
  useEffect(() => {
    if (!activeId || activeId === activeItemRef.current) return;

    // Update the ref to avoid unnecessary scrolling
    activeItemRef.current = activeId;

    // Find the active TOC item
    const activeElement = document.getElementById(`toc-item-${activeId}`);
    const container = tocContainerRef.current;

    if (activeElement && container) {
      // Calculate position
      const containerRect = container.getBoundingClientRect();
      const activeRect = activeElement.getBoundingClientRect();
      
      // Check if element is outside viewport
      const isVisible = 
        activeRect.top >= containerRect.top &&
        activeRect.bottom <= containerRect.bottom;
      
      if (!isVisible) {
        // Scroll the element into view with a smooth effect
        container.scrollTo({
          top: activeElement.offsetTop - container.offsetHeight / 2 + activeElement.offsetHeight / 2,
          behavior: "smooth"
        });
      }
    }
  }, [activeId]);

  // Improved scroll spy
  useEffect(() => {
    // If there are no valid items, don't set up observers
    if (!hasValidItems || !isVisible) return;

    const allIds = getAllIds(toc);

    // Function to determine which heading is currently active
    const determineActiveHeading = () => {
      // Special case for top of page
      if (window.scrollY < 100) {
        const firstId = findFirstItemWithId(toc);
        if (firstId) {
          setActiveId(firstId);
          return;
        }
      }

      // Special case for bottom of page
      const bottomPosition = window.innerHeight + window.scrollY;
      const isAtBottom = bottomPosition >= document.body.offsetHeight - 50;

      if (isAtBottom) {
        // Find the last valid ID
        const lastValidId = allIds[allIds.length - 1];
        if (lastValidId) {
          setActiveId(lastValidId);
          return;
        }
      }

      // Get all headings and convert to array
      const headings = Array.from(getHeaderElements()) as HTMLElement[];
      if (headings.length === 0) return;

      // Calculate viewport center
      const viewportHeight = window.innerHeight;
      const viewportCenter = viewportHeight / 2;

      // Map headings to their positions and calculate section centers
      const headingData = headings.map((heading, index) => {
        const rect = heading.getBoundingClientRect();
        let sectionBottom;

        // Determine section bottom (next heading or viewport bottom)
        if (index < headings.length - 1) {
          const nextHeadingRect = headings[index + 1].getBoundingClientRect();
          sectionBottom = nextHeadingRect.top;
        } else {
          // For the last heading, check if we can see the bottom of the page
          const pageBottomPosition = document.body.offsetHeight;
          const scrollBottom = window.scrollY + viewportHeight;
          const remainingPage = Math.max(0, pageBottomPosition - scrollBottom);

          sectionBottom =
            remainingPage > 0
              ? viewportHeight // The section extends beyond viewport
              : document.body.getBoundingClientRect().bottom;
        }

        // Calculate section center and distance to viewport center
        const sectionCenter = (rect.top + sectionBottom) / 2;
        const distanceToCenter = Math.abs(sectionCenter - viewportCenter);

        // Check if section is visible
        const isVisible =
          (rect.bottom > 0 && rect.top < viewportHeight) || // At least partially visible
          (rect.top <= 0 && sectionBottom >= 0); // Header is above viewport but section is visible

        return {
          id: heading.id,
          top: rect.top,
          bottom: sectionBottom,
          sectionCenter,
          distanceToCenter,
          isVisible,
          // How much of the section is visible as a percentage
          visiblePercentage: isVisible
            ? (Math.min(sectionBottom, viewportHeight) -
                Math.max(rect.top, 0)) /
              (sectionBottom - rect.top)
            : 0,
        };
      });

      // Filter for visible sections
      const visibleSections = headingData.filter(
        (section) => section.isVisible,
      );

      if (visibleSections.length === 0) {
        // No sections visible, find closest section (above or below)
        const closestSection = headingData.sort(
          (a, b) =>
            Math.min(Math.abs(a.top), Math.abs(a.bottom - viewportHeight)) -
            Math.min(Math.abs(b.top), Math.abs(b.bottom - viewportHeight)),
        )[0];
        setActiveId(closestSection.id);
      } else if (visibleSections.length === 1) {
        // Only one section visible, highlight it
        setActiveId(visibleSections[0].id);
      } else {
        // Multiple sections visible, prioritize by:
        // 1. Section with center closest to viewport center
        // 2. Section with most visibility percentage

        // First check if any section has high visibility (over 50%)
        const highlyVisibleSections = visibleSections.filter(
          (s) => s.visiblePercentage > 0.5,
        );

        if (highlyVisibleSections.length > 0) {
          // If we have highly visible sections, choose the one closest to center
          const closestToCenter = highlyVisibleSections.sort(
            (a, b) => a.distanceToCenter - b.distanceToCenter,
          )[0];
          setActiveId(closestToCenter.id);
        } else {
          // Otherwise just pick the section closest to center
          const closestToCenter = visibleSections.sort(
            (a, b) => a.distanceToCenter - b.distanceToCenter,
          )[0];
          setActiveId(closestToCenter.id);
        }
      }
    };

    // Initial check
    determineActiveHeading();

    // Scroll event listener with throttling for better performance
    let ticking = false;
    const scrollHandler = () => {
      if (disableScrollRef.current) return;
      if (!ticking) {
        window.requestAnimationFrame(() => {
          determineActiveHeading();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", scrollHandler, { passive: true });

    return () => {
      window.removeEventListener("scroll", scrollHandler);
    };
  }, [
    hasValidItems,
    toc,
    getHeaderElements,
    getAllIds,
    isVisible,
    findFirstItemWithId,
  ]);

  // If there are no valid items or screen is too small, don't render
  if (!hasValidItems || !isVisible) return null;

  const scrollToHeader = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      disableScrollRef.current = true;
      window.scrollTo({
        top: element.offsetTop - 100,
        behavior: "instant",
      });
      window.addEventListener(
        "scroll",
        () => {
          disableScrollRef.current = false;
        },
        {
          once: true,
          passive: true,
        },
      );
      setActiveId(id);
    }
  };

  const renderTocItem = (item: TocEntry, parentDepth = 0) => {
    // Skip rendering if no id is available
    if (!item.id) return null;

    const isActive = activeId === item.id;
    const depth = parentDepth + item.depth;
    const children = item.children || [];
    const hasChildren = children.length > 0;

    return (
      <li key={item.id} className="-ml-px flex flex-col items-start">
        <button
          id={`toc-item-${item.id}`}
          onClick={() => scrollToHeader(item.id!)}
          className={`
            inline-block border-l py-2 pl-4 text-left
            ${
              isActive
                ? "border-primary-600 dark:border-primary-400 text-primary-700 dark:text-primary-300 font-medium"
                : "border-transparent text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            }
            text-sm
          `}
          style={{
            paddingLeft: `${2 + depth * 6}px`,
          }}
        >
          {item.value}
        </button>
        {hasChildren && (
          <ul className="w-full flex flex-col border-l border-gray-200 dark:border-gray-700">
            {children.map((child) => renderTocItem(child, depth))}
          </ul>
        )}
      </li>
    );
  };

  return (
    <nav
      className="fixed right-8 top-16 w-72 z-10"
      style={{ display: isVisible ? "block" : "none" }}
    >
      <div 
        ref={tocContainerRef}
        className="max-h-[calc(100vh-8rem)] overflow-y-auto p-4"
      >
        <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
          On this page
        </h3>
        <ul className="flex flex-col space-y-1 border-l border-gray-200 dark:border-gray-700">
          {toc.map((item) => renderTocItem(item))}
        </ul>
      </div>
    </nav>
  );
};

export function RootLayout() {
  const { theme, toggleTheme } = useTheme();
  const logoFull = theme === "light" ? logoFullLight : logoFullDark;
  const logoIcon = theme === "light" ? logoIconLight : logoIconDark;
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  const matches = useMatches();
  const layout = matches.reverse().find((match) => match.staticData?.layout)?.staticData
    ?.layout;
  const tableOfContents = matches.reverse().find(
    (match) => match.staticData?.tableOfContents,
  )?.staticData?.tableOfContents;

  // Handle responsive behavior
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
    <div className="min-h-screen flex bg-white dark:bg-gray-900">
      {/* Sidebar */}
      <aside
        className={`${sidebarOpen ? "w-64" : "w-16"} hidden md:flex h-screen sticky top-0 flex-shrink-0 border-r border-gray-200 dark:border-gray-700 flex flex-col transition-all duration-200 ease-in-out ${isMobile ? (sidebarOpen ? "translate-x-0" : "-translate-x-full") : ""}`}
      >
        <div className="flex-shrink-0 p-4 flex items-center justify-between">
          <Link to="/" className="flex items-center">
            {sidebarOpen ? (
              <img
                src={logoFull}
                alt="React TanStack Table UI"
                className="h-8"
              />
            ) : (
              <img
                src={logoIcon}
                alt="React TanStack Table UI"
                className="h-8 w-8"
              />
            )}
          </Link>
          {!isMobile && (
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              aria-label="Toggle sidebar"
            >
              {sidebarOpen ? (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
                  />
                </svg>
              ) : (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 5l7 7-7 7M5 5l7 7-7 7"
                  />
                </svg>
              )}
            </button>
          )}
        </div>
        <nav
          className={`flex-1 px-2 py-4 ${sidebarOpen ? "space-y-2" : "space-y-4"} overflow-y-auto`}
        >
          {/* Expanded Sidebar */}
          {sidebarOpen && (
            <>
              {navigation.map((section) => (
                <SidebarSection
                  key={section.title}
                  title={section.title}
                  items={"children" in section ? section.children : []}
                  path={"path" in section ? section.path : undefined}
                  defaultExpanded={
                    "defaultExpanded" in section && section.defaultExpanded
                  }
                />
              ))}
            </>
          )}

          {/* Icons-only view when collapsed */}
          {!sidebarOpen && (
            <div className="flex flex-col items-center space-y-4">
              <Link
                to="/docs/getting-started"
                className="p-2 rounded-md text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
                activeProps={{
                  className:
                    "bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300",
                }}
                title="Documentation"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </Link>
              <Link
                to={"/core-concepts/column-auto-sizing" as any}
                className="p-2 rounded-md text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
                activeProps={{
                  className:
                    "bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300",
                }}
                title="Core Concepts"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                  />
                </svg>
              </Link>
              <Link
                to={"/skins/default" as any}
                className="p-2 rounded-md text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
                activeProps={{
                  className:
                    "bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300",
                }}
                title="Skins"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
                  />
                </svg>
              </Link>
              <Link
                to={"/examples/minimal" as any}
                className="p-2 rounded-md text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
                activeProps={{
                  className:
                    "bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300",
                }}
                title="Examples"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </Link>
              <Link
                to={"/api" as any}
                className="p-2 rounded-md text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
                activeProps={{
                  className:
                    "bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300",
                }}
                title="API Reference"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </Link>
            </div>
          )}
        </nav>
        <div
          className={`flex-shrink-0 p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 ${!sidebarOpen && "justify-center"}`}
        >
          <div className="flex items-center justify-between">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              aria-label="Toggle dark mode"
            >
              {theme === "light" ? (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                  />
                </svg>
              ) : (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                  />
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
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    fillRule="evenodd"
                    d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.91-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                    clipRule="evenodd"
                  />
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
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          ) : (
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          )}
        </button>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        <main className="flex-1 overflow-auto">
          <div className={tableOfContents ? "xl:pr-72" : ""}>
            <div
              className={
                layout === "full"
                  ? "w-full"
                  : "prose dark:prose-invert max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
              }
            >
              <Outlet />
            </div>
            {tableOfContents && (
              <TableOfContents
                toc={tableOfContents}
                sidebarOpen={sidebarOpen}
              />
            )}
          </div>
          <TanStackRouterDevtools position="bottom-right" />
        </main>
        <footer className="border-t border-gray-200 dark:border-gray-700 py-4">
          <div className="px-4">
            <div className="h-[36px] flex items-center justify-center">
              <p className="text-center text-gray-500 dark:text-gray-400 text-sm">
                MIT License {new Date().getFullYear()}{" "}
                <a
                  href="https://github.com/ricsam"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  @ricsam
                </a>
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
