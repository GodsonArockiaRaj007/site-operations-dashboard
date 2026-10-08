import { useState } from "react";
import {
  LayoutDashboard,
  MapPin,
  Menu,
  Wrench,
  X,
} from "lucide-react";
import {
  NavLink,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import Sites from "./pages/Sites";
import Installations from "./pages/Installations";

const navigation = [
  { label: "Dashboard", to: "/", icon: LayoutDashboard, end: true },
  { label: "Sites", to: "/sites", icon: MapPin },
  { label: "Installations", to: "/installations", icon: Wrench },
];

const App = () => {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const location = useLocation();
  const currentPage =
    navigation.find((item) =>
      item.end
        ? location.pathname === item.to
        : location.pathname.startsWith(item.to)
    )?.label || "Page not found";

  return (
    <div
      className="min-h-screen bg-slate-50 text-slate-900"
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          setMobileNavOpen(false);
        }
      }}
    >
      {mobileNavOpen && (
        <button
          type="button"
          aria-label="Close navigation menu"
          className="fixed inset-0 z-40 bg-slate-950/30 md:hidden"
          onClick={() => setMobileNavOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[264px] flex-col border-r border-slate-200 bg-white transition-transform duration-200 md:visible md:translate-x-0 ${
          mobileNavOpen
            ? "visible translate-x-0"
            : "invisible -translate-x-full"
        }`}
        aria-label="Main navigation"
      >
        <div className="flex h-[76px] items-center justify-between border-b border-slate-200 px-6">
          <NavLink
            to="/"
            className="flex items-center gap-3 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
            onClick={() => setMobileNavOpen(false)}
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white">
              <MapPin size={21} strokeWidth={2.2} />
            </span>
            <span>
              <span className="block text-base font-semibold tracking-tight text-slate-900">
                SiteOps
              </span>
              <span className="mt-0.5 block text-xs text-slate-500">
                Operations platform
              </span>
            </span>
          </NavLink>
          <button
            type="button"
            aria-label="Close navigation"
            onClick={() => setMobileNavOpen(false)}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 md:hidden"
          >
            <X size={19} />
          </button>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-6">
          <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
            Workspace
          </p>
          {navigation.map(({ label, to, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={() => setMobileNavOpen(false)}
              className={({ isActive }) =>
                `group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
                  isActive
                    ? "bg-blue-50 text-blue-700"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`
              }
            >
              <Icon size={18} strokeWidth={1.9} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-slate-200 p-5">
          <div className="rounded-lg bg-slate-50 px-3 py-3">
            <p className="text-xs font-medium text-slate-700">
              Site operations
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Manage sites and field work
            </p>
          </div>
        </div>
      </aside>

      <div className="app-content min-h-screen md:pl-[264px]">
        <header className="sticky top-0 z-30 flex h-[64px] items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="Open navigation"
              aria-expanded={mobileNavOpen}
              onClick={() => setMobileNavOpen(true)}
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 md:hidden"
            >
              <Menu size={20} />
            </button>
            <div>
              <p className="text-sm font-semibold text-slate-800">
                {currentPage}
              </p>
              <p className="hidden text-xs text-slate-500 sm:block">
                Site operations workspace
              </p>
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1440px] px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/sites" element={<Sites />} />
            <Route path="/installations" element={<Installations />} />
            <Route
              path="*"
              element={
                <section className="rounded-xl border border-slate-200 bg-white p-8">
                  <h1 className="text-xl font-semibold">Page not found</h1>
                  <p className="mt-2 text-sm text-slate-600">
                    The page you requested does not exist.
                  </p>
                </section>
              }
            />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default App;
