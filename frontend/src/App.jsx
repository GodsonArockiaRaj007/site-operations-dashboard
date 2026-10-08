import {
  NavLink,
  Route,
  Routes,
} from "react-router-dom";

import {
  LayoutDashboard,
  MapPin,
  Wrench,
} from "lucide-react";

import Dashboard from "./pages/Dashboard";
import Sites from "./pages/Sites";
import Installations from "./pages/Installations";

const App = () => {
  const navClass = ({ isActive }) =>
    `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
      isActive
        ? "bg-blue-50 text-blue-600"
        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
    }`;

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-screen w-64 border-r border-slate-200 bg-white">
        {/* Logo */}
        <div className="border-b border-slate-200 p-6">
          <h1 className="text-xl font-bold text-slate-800">
            SiteOps
          </h1>

          <p className="mt-1 text-xs text-slate-500">
            Operations Management
          </p>
        </div>

        {/* Navigation */}
        <nav className="space-y-2 p-4">
          <NavLink
            to="/"
            end
            className={navClass}
          >
            <LayoutDashboard size={19} />
            Dashboard
          </NavLink>

          <NavLink
            to="/sites"
            className={navClass}
          >
            <MapPin size={19} />
            Sites
          </NavLink>

          <NavLink
            to="/installations"
            className={navClass}
          >
            <Wrench size={19} />
            Installations
          </NavLink>
        </nav>
      </aside>

      {/* Main */}
      <main className="ml-64 min-h-screen flex-1">
        <Routes>
          <Route
            path="/"
            element={<Dashboard />}
          />

          <Route
            path="/sites"
            element={<Sites />}
          />

          <Route
            path="/installations"
            element={<Installations />}
          />

          <Route
            path="*"
            element={
              <div className="p-8">
                <h1 className="text-2xl font-bold">
                  Page Not Found
                </h1>
              </div>
            }
          />
        </Routes>
      </main>
    </div>
  );
};

export default App;