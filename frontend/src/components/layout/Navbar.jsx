import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, LogOut, User, ShieldAlert, Clock, LogIn, ChevronDown } from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import * as attendanceService from '../../features/attendance/attendanceService';
import { useToast } from '../../components/ui/Toast';
import Button from '../ui/Button';

export default function Navbar({ onMenuToggle }) {
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const isMock = import.meta.env.VITE_USE_MOCK === "true";

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Attendance states for employee
  const [todayRecord, setTodayRecord] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Load today's attendance state
  const loadTodayAttendance = async () => {
    if (!user || user.role !== 'employee') return;
    try {
      const todayStr = new Date().toISOString().substring(0, 10);
      const data = await attendanceService.getAttendanceMe(user.userId, todayStr, todayStr);
      if (data && data.length > 0) {
        // Find today's record
        const todayRec = data.find(l => l.date === todayStr);
        setTodayRecord(todayRec || null);
      } else {
        setTodayRecord(null);
      }
    } catch (err) {
      console.error("Failed to load today clock state in Navbar.", err);
    }
  };

  useEffect(() => {
    loadTodayAttendance();
    
    // Listen for attendance updates from other screens (like Attendance portal)
    window.addEventListener('attendance-updated', loadTodayAttendance);
    return () => window.removeEventListener('attendance-updated', loadTodayAttendance);
  }, [user]);

  const handleCheckIn = async () => {
    setActionLoading(true);
    try {
      await attendanceService.checkIn(user.userId);
      showToast("Checked in successfully!", "success");
      await loadTodayAttendance();
      // Dispatch event to sync other pages
      window.dispatchEvent(new Event('attendance-updated'));
    } catch (err) {
      showToast(err.response?.data?.error || "Check-in failed.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setActionLoading(true);
    try {
      await attendanceService.checkOut(user.userId);
      showToast("Checked out successfully!", "success");
      await loadTodayAttendance();
      // Dispatch event to sync other pages
      window.dispatchEvent(new Event('attendance-updated'));
    } catch (err) {
      showToast(err.response?.data?.error || "Check-out failed.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  if (!user) return null;

  const isCheckedIn = !!todayRecord;
  const isCheckedOut = isCheckedIn && !!todayRecord.checkOut;

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
          {user.role === 'admin' ? 'Admin Portal' : 'Employee Portal'}
        </div>
      </div>

      {/* Right side: Actions + Dropdown profile */}
      <div className="flex items-center gap-4">
        {/* Mock Data Banner */}
        {isMock && (
          <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-bold tracking-wider text-amber-800 bg-amber-50 border border-amber-200 uppercase">
            <ShieldAlert className="w-3.5 h-3.5" />
            Mock Mode
          </div>
        )}

        {/* Global Employee Punch In/Out button inside Top Navbar Bar */}
        {user.role === 'employee' && (
          <div className="flex items-center gap-2">
            {!isCheckedIn ? (
              <Button
                onClick={handleCheckIn}
                loading={actionLoading}
                disabled={actionLoading}
                variant="success"
                size="sm"
                className="text-[10px] font-bold py-1.5 h-8"
                icon={LogIn}
              >
                Clock In
              </Button>
            ) : !isCheckedOut ? (
              <Button
                onClick={handleCheckOut}
                loading={actionLoading}
                disabled={actionLoading}
                variant="danger"
                size="sm"
                className="text-[10px] font-bold py-1.5 h-8"
                icon={LogOut}
              >
                Clock Out
              </Button>
            ) : (
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg flex items-center gap-1">
                <Clock className="w-3 h-3 text-emerald-500" />
                Done Today
              </span>
            )}
          </div>
        )}
        
        {/* User Info Dropdown Trigger */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 hover:bg-neutral-50 p-1.5 rounded-xl transition-all"
          >
            <div className="hidden text-right md:block">
              <p className="text-xs font-bold text-neutral-800 leading-3">{user.name}</p>
              <span className="text-[9px] text-neutral-500 font-semibold capitalize mt-0.5">{user.role}</span>
            </div>
            
            <div className="w-8 h-8 rounded-full bg-primary-50 hover:bg-primary-100 flex items-center justify-center font-bold text-primary-600 text-xs border border-primary-100 uppercase select-none shrink-0 transition-colors">
              {user.name.substring(0, 2)}
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
          </button>

          {/* User Options Dropdown Menu */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-neutral-200 rounded-xl shadow-xl z-50 py-1.5 animate-slide-up">
              <div className="px-4 py-2 border-b border-neutral-100 text-neutral-400">
                <p className="text-[9px] font-bold uppercase tracking-wider">Signed in as</p>
                <p className="text-xs font-bold text-neutral-700 truncate mt-0.5">{user.name}</p>
                <p className="text-[9px] text-primary-500 font-bold tracking-wider mt-0.5">{user.employeeId}</p>
              </div>

              {/* My Profile Link */}
              {user.role === 'employee' ? (
                <Link
                  to="/profile"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900 transition-colors"
                >
                  <User className="w-4 h-4 text-neutral-400" />
                  My Profile
                </Link>
              ) : (
                <Link
                  to="/admin/employees"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900 transition-colors"
                >
                  <User className="w-4 h-4 text-neutral-400" />
                  Employee Directory
                </Link>
              )}

              {/* Logout Button */}
              <button
                onClick={() => {
                  setDropdownOpen(false);
                  logout();
                }}
                className="flex items-center gap-2 w-full text-left px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-colors border-t border-neutral-100"
              >
                <LogOut className="w-4 h-4" />
                Log Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
