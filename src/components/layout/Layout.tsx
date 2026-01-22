import { Outlet } from "react-router-dom";
import { Toaster } from "sonner";
import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";

export default function Layout() {
  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <Header />

      {/* Page Content */}
      <main className="min-h-[calc(100vh-133px)]">
        <Outlet />
      </main>

      {/* Footer */}
      <Footer />

      {/* Toast Notifications */}
      <Toaster richColors />
    </div>
  );
}
