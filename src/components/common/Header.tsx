import { Link, useLocation, useNavigate } from "react-router-dom";
import { authService } from "@/services/auth.service";
import { LayoutDashboard, LogOut, Receipt, Settings } from "lucide-react";

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await authService.signOut();
    navigate("/login");
  };

  const navItems = [
    { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { path: "/expenses", label: "Expenses", icon: Receipt },
    { path: "/settings", label: "Settings", icon: Settings },
  ];
  return (
    <nav className="bg-white shadow-sm">
      <div className="md:w-10/12 mx-auto sm:w-full sm:px-6 md:px-0">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="shrink-0 flex items-center">
              <h1 className="text-xl font-bold text-gray-900">
                Expense Tracker
              </h1>
            </div>
            <div className="hidden sm:ml-6 sm:flex">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`inline-flex items-center px-4 pt-1 border-b-2 text-sm font-medium ${
                      isActive
                        ? "border-primary text-gray-900"
                        : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                    }`}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
          <div className="flex items-center">
            <button
              onClick={handleSignOut}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Header;
