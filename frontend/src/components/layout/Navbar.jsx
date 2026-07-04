import React from 'react';
import { Menu, LogOut, User, ShieldAlert } from 'lucide-react';
import useAuth from '../../hooks/useAuth';

export default function Navbar({ onMenuToggle }) {
  const { user, logout } = useAuth();
  const isMock = import.meta.env.VITE_USE_MOCK === "true";

  if (!user) return null;

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between w-full h-16 px-6 bg-white border-b border-neutral-200/80 shadow-sm">
      {/* Left side: Hamburger button + Page label */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuToggle}
          className="p-1 rounded-lg text-neutral-500 hover:bg-neutral-50 hover:text-neutral-700 md:hidden"
        >
          <Menu className="w-6 h-6" />
        </button>
        <div className="text-sm font-bold text-neutral-800 tracking-wide uppercase">
          {user.role === 'admin' ? 'Admin portal' : 'Employee space'}
        </div>
      </div>

      {/* Right side: Mock badge + profile brief */}
      <div className="flex items-center gap-4">
        {/* Mock Data Banner */}
        {isMock && (
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider text-amber-800 bg-amber-50 border border-amber-200 uppercase">
            <ShieldAlert className="w-3.5 h-3.5" />
            Mock Mode
          </div>
        )}
        
        {/* User Info & Actions */}
        <div className="flex items-center gap-3">
          <div className="hidden text-right md:block">
            <p className="text-xs font-bold text-neutral-800 leading-3">{user.name}</p>
            <span className="text-[10px] text-neutral-500 capitalize">{user.role}</span>
          </div>
          
          <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center font-bold text-neutral-700 text-xs border border-neutral-200 uppercase select-none">
            {user.name.substring(0, 2)}
          </div>

          <button
            onClick={logout}
            title="Log Out"
            className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-500 hover:bg-rose-50 transition-colors"
          >
            <LogOut className="w-4.5 h-4.5" />
          </button>
        </div>
      </div>
    </header>
  );
}
