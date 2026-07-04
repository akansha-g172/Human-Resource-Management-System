import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import * as attendanceService from '../attendance/attendanceService';
import * as leaveService from '../leave/leaveService';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import StatusBadge from '../../components/ui/StatusBadge';
import Spinner from '../../components/ui/Spinner';
import Button from '../../components/ui/Button';
import { useToast } from '../../components/ui/Toast';
import { 
  User, 
  Clock, 
  CalendarDays, 
  LogOut, 
  ArrowRight, 
  CheckCircle2, 
  XCircle, 
  PlusCircle, 
  UserCircle 
} from 'lucide-react';
import { formatToHumanDate, formatToTime } from '../../utils/dateHelpers';

export default function EmployeeDashboard() {
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [todayAttendance, setTodayAttendance] = useState(null); // today's attendance record
  const [recentAttendance, setRecentAttendance] = useState([]);
  const [recentLeaves, setRecentLeaves] = useState([]);

  const loadDashboardData = async () => {
    try {
      const todayStr = new Date().toISOString().substring(0, 10);
      
      // Fetch data in parallel
      const [attList, leaveList] = await Promise.all([
        attendanceService.getAttendanceMe(user.userId, null, null),
        leaveService.getLeaveMe(user.userId)
      ]);

      // Find today's record
      const todayRec = attList.find(a => a.date === todayStr);
      setTodayAttendance(todayRec || null);
      
      // Get recent 3 items
      setRecentAttendance(attList.slice(0, 3));
      setRecentLeaves(leaveList.slice(0, 3));
    } catch (err) {
      showToast("Failed to load dashboard data.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
    
    // Sync state when check in status changes on Navbar
    window.addEventListener('attendance-updated', loadDashboardData);
    return () => window.removeEventListener('attendance-updated', loadDashboardData);
  }, [user]);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }


  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-neutral-900 to-neutral-800 rounded-2xl p-6 md:p-8 text-white border border-neutral-800 shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 rounded-full bg-primary-600/10 blur-3xl pointer-events-none" />
        <h1 className="text-xl md:text-2xl font-black tracking-wide">
          Hello, {user.name}!
        </h1>
        <p className="text-neutral-300 text-xs md:text-sm mt-1 max-w-xl">
          Welcome to your workspace. Here is a summary of your schedule and actions for today.
        </p>
      </div>

      {/* Grid: Today's Status */}
      <div className="max-w-md">
        
        {/* Today's Clock In Card */}
        <Card className="border-primary-100/50 shadow-md">
          <CardHeader className="bg-primary-50/20">
            <CardTitle className="text-sm font-bold text-neutral-800 flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary-500" />
              Today's Attendance
            </CardTitle>
            <CardDescription>Clock state for today</CardDescription>
          </CardHeader>
          <CardContent className="py-6 flex flex-col justify-between h-48">
            <div>
              {todayAttendance ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-success-500" />
                    <span className="text-sm font-bold text-neutral-800">Checked In</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-neutral-500 bg-neutral-50 p-3 rounded-lg border border-neutral-100">
                    <div>
                      <span className="block font-semibold text-[10px] uppercase text-neutral-400">In Time</span>
                      <span className="font-bold text-neutral-700 text-sm mt-0.5 block">
                        {formatToTime(todayAttendance.checkIn)}
                      </span>
                    </div>
                    <div>
                      <span className="block font-semibold text-[10px] uppercase text-neutral-400">Out Time</span>
                      <span className="font-bold text-neutral-700 text-sm mt-0.5 block">
                        {todayAttendance.checkOut ? formatToTime(todayAttendance.checkOut) : '--:--'}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <XCircle className="w-5 h-5 text-neutral-400" />
                    <span className="text-sm font-bold text-neutral-500">Not Checked In Yet</span>
                  </div>
                  <p className="text-xs text-neutral-400 leading-normal">
                    Please make sure to clock in once you start working today.
                  </p>
                </div>
              )}
            </div>

            <Link to="/attendance" className="block mt-4">
              <Button className="w-full text-xs font-semibold py-2" size="sm" variant="outline">
                View History
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            </Link>
          </CardContent>
        </Card>

      </div>

      {/* Grid: Recent Activity Lists */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Recent Attendance Entries */}
        <Card className="shadow-sm">
          <CardHeader className="border-b border-neutral-100 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm font-bold text-neutral-800">Recent Attendance Logs</CardTitle>
              <CardDescription>Last 3 logs</CardDescription>
            </div>
            <Link to="/attendance" className="text-xs font-bold text-primary-600 hover:underline">
              View All
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            {recentAttendance.length > 0 ? (
              <div className="divide-y divide-neutral-100">
                {recentAttendance.map((entry) => (
                  <div key={entry.id} className="flex items-center justify-between p-4 hover:bg-neutral-50/50 transition-colors">
                    <div>
                      <p className="text-xs font-bold text-neutral-700">{formatToHumanDate(entry.date)}</p>
                      <p className="text-[10px] text-neutral-400 font-semibold mt-0.5">
                        {entry.checkIn ? formatToTime(entry.checkIn) : '--:--'} - {entry.checkOut ? formatToTime(entry.checkOut) : 'Present'}
                      </p>
                    </div>
                    <StatusBadge status={entry.status} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-neutral-400">
                No attendance logs found.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Leave Requests */}
        <Card className="shadow-sm">
          <CardHeader className="border-b border-neutral-100 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm font-bold text-neutral-800">Recent Leave Requests</CardTitle>
              <CardDescription>Last 3 requests</CardDescription>
            </div>
            <Link to="/leave" className="text-xs font-bold text-primary-600 hover:underline">
              View All
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            {recentLeaves.length > 0 ? (
              <div className="divide-y divide-neutral-100">
                {recentLeaves.map((request) => (
                  <div key={request.id} className="flex items-center justify-between p-4 hover:bg-neutral-50/50 transition-colors">
                    <div className="min-w-0 flex-1 pr-4">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-neutral-700 capitalize">{request.leaveType} Leave</span>
                        <span className="text-[10px] text-neutral-400 font-medium">
                          ({formatToHumanDate(request.startDate)} to {formatToHumanDate(request.endDate)})
                        </span>
                      </div>
                      <p className="text-[10px] text-neutral-500 truncate mt-1">
                        "{request.remarks}"
                      </p>
                    </div>
                    <StatusBadge status={request.status} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-neutral-400">
                No leave requests found.
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
