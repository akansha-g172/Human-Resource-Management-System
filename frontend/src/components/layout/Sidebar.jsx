import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  CalendarCheck, 
  CalendarDays, 
  User, 
  Clock, 
  LogOut, 
  X,
  Sparkles,
  CreditCard
} from 'lucide-react';
import useAuth from '../../hooks/useAuth';

export default function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth();
  
  if (!user) return null;

  const employeeLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/profile', label: 'My Profile', icon: User },
    { to: '/attendance', label: 'Attendance', icon: Clock },
    { to: '/leave', label: 'Apply Leave', icon: CalendarCheck },
    { to: '/payroll', label: 'My Payroll', icon: CreditCard },
  ];

  const adminLinks = [
    { to: '/admin/employees', label: 'Employees', icon: Users },
    { to: '/admin/leave', label: 'Leave Requests', icon: CalendarDays },
    { to: '/admin/attendance', label: 'Attendance logs', icon: Clock },
    { to: '/admin/payroll', label: 'Payroll Control', icon: CreditCard },
  ];

  const links = user.role === 'admin' ? adminLinks : employeeLinks;

  return (
    <>
      {/* Sidebar Overlay for Mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-neutral-900/40 backdrop-blur-sm md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-40 w-64 h-screen border-r border-neutral-800 bg-neutral-900 text-white flex flex-col justify-between transition-transform duration-300 md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Upper Sidebar */}
        <div>
          {/* Brand header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-800">
            <div className="flex items-center gap-2">
              <div className="bg-primary-600 p-1.5 rounded-lg">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="font-extrabold text-base tracking-wide text-white">
                HR<span className="text-primary-400">Flow</span>
              </span>
            </div>
            {/* Mobile close button */}
            <button 
              onClick={onClose}
              className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 md:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User profile brief */}
          <div className="px-6 py-6 border-b border-neutral-800 bg-neutral-950/40">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary-600/20 border border-primary-500/30 flex items-center justify-center font-bold text-primary-400 uppercase text-sm shrink-0">
                {user.name.substring(0, 2)}
              </div>
              <div className="min-w-0">
                <p className="font-bold text-xs text-neutral-100 truncate">{user.name}</p>
                <p className="text-[10px] text-neutral-400 font-semibold capitalize mt-0.5">{user.role}</p>
                <p className="text-[9px] text-primary-400 font-bold tracking-wider uppercase mt-0.5">{user.employeeId}</p>
              </div>
            </div>
          </div>

          {/* Nav links */}
          <nav className="px-4 py-6 flex flex-col gap-1.5">
            {links.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all duration-200 ${
                      isActive
                        ? 'bg-primary-600 text-white shadow-md shadow-primary-900/30 font-bold'
                        : 'text-neutral-400 hover:bg-neutral-800 hover:text-white'
                    }`
                  }
                >
                  <Icon className="w-4 h-4" />
                  {link.label}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Lower Sidebar / Logout */}
        <div className="p-4 border-t border-neutral-800">
          <button
            onClick={() => {
              onClose();
              logout();
            }}
            className="flex items-center gap-3 w-full px-4 py-2.5 text-xs font-semibold tracking-wide text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 rounded-lg transition-all"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
