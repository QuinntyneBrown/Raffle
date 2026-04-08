import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { NavBar } from './NavBar';
import { MobileNav } from './MobileNav';

export function AdminLayout() {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex">
      {/* Sidebar - desktop only */}
      <Sidebar />

      {/* Main area */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Mobile nav */}
        <MobileNav />

        {/* Desktop navbar */}
        <div className="hidden lg:block">
          <NavBar />
        </div>

        {/* Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
