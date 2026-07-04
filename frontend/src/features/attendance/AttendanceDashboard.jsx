import React, { useEffect, useState } from 'react';
import useAuth from '../../hooks/useAuth';
import * as attendanceService from './attendanceService';
import CheckInOutCard from './CheckInOutCard';
import AttendanceCalendarView from './AttendanceCalendarView';
import Spinner from '../../components/ui/Spinner';
import { useToast } from '../../components/ui/Toast';
import { Clock } from 'lucide-react';

export default function AttendanceDashboard() {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [logs, setLogs] = useState([]);
  const [todayRecord, setTodayRecord] = useState(null);

  const loadAttendance = async () => {
    try {
      const data = await attendanceService.getAttendanceMe(user.userId, null, null);
      // Sort newest date first
      const sorted = [...data].sort((a, b) => new Date(b.date) - new Date(a.date));
      setLogs(sorted);
      
      const todayStr = new Date().toISOString().substring(0, 10);
      const todayRec = sorted.find(l => l.date === todayStr);
      setTodayRecord(todayRec || null);
    } catch (err) {
      showToast(err.response?.data?.error || "Failed to load attendance logs.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadAttendance();
    }
  }, [user]);

  const handleCheckIn = async () => {
    setActionLoading(true);
    try {
      const data = await attendanceService.checkIn(user.userId);
      showToast("Checked in successfully! Have a good work session.", "success");
      await loadAttendance(); // reload logs
    } catch (err) {
      showToast(err.response?.data?.error || "Check-in failed.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setActionLoading(true);
    try {
      const data = await attendanceService.checkOut(user.userId);
      showToast("Checked out successfully! Have a good rest.", "success");
      await loadAttendance(); // reload logs
    } catch (err) {
      showToast(err.response?.data?.error || "Check-out failed.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <div className="bg-primary-50 p-2 rounded-xl border border-primary-100 text-primary-600">
          <Clock className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-xl font-black text-neutral-800">Attendance Portal</h1>
          <p className="text-xs text-neutral-500">Record your daily work presence and review timesheets</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Punch clock widget */}
        <div className="lg:col-span-1">
          <CheckInOutCard
            todayRecord={todayRecord}
            onCheckIn={handleCheckIn}
            onCheckOut={handleCheckOut}
            actionLoading={actionLoading}
          />
        </div>

        {/* History log charts / tables */}
        <div className="lg:col-span-2">
          <AttendanceCalendarView logs={logs} />
        </div>
      </div>
    </div>
  );
}
