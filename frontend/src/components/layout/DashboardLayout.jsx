import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="flex min-h-screen bg-neutral-50/50">
      {/* Sidebar navigation */}
      <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />

      {/* Main content viewport */}
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar onMenuToggle={toggleSidebar} />
        
        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto animate-fade-in overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
