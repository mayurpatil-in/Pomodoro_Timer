import { useState } from "react";
import { Outlet } from "react-router-dom";
import { DesktopSidebar, MobileSidebar, MobileBottomNav } from "./Sidebar";
import Header from "./Header";

export default function DashboardLayout({ darkMode, setDarkMode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div
      className={`flex h-screen overflow-hidden ${darkMode ? "bg-[#0f0f16]" : "bg-slate-50"}`}
    >
      {/* Desktop Sidebar */}
      <DesktopSidebar darkMode={darkMode} />

      {/* Mobile Slide-over Sidebar */}
      <MobileSidebar
        darkMode={darkMode}
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:ml-60 min-w-0">
        {/* Header */}
        <Header
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          onMenuClick={() => setMobileMenuOpen(true)}
        />

        {/* Scrollable Content Page — extra bottom padding on mobile for the bottom nav */}
        <main className="flex-1 overflow-y-auto stylish-scrollbar relative p-4 md:p-8 pb-24 lg:pb-8">
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav darkMode={darkMode} />
    </div>
  );
}
