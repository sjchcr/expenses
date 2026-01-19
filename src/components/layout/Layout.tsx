import { Outlet } from "react-router-dom";
import { Toaster } from "sonner";
import Header from "../common/Header";

export default function Layout() {
  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <Header />

      {/* Page Content */}
      <main>
        <Outlet />
      </main>

      {/* Toast Notifications */}
      <Toaster richColors />
    </div>
  );
}
