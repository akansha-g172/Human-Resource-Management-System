import React, { useEffect, useState } from 'react';
import * as adminService from './adminService';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import Spinner from '../../components/ui/Spinner';
import Button from '../../components/ui/Button';
import StatusBadge from '../../components/ui/StatusBadge';
import { useToast } from '../../components/ui/Toast';
import { 
  CalendarDays, 
  Search, 
  User, 
  Clock, 
  Filter, 
  RefreshCw 
} from 'lucide-react';
import { formatToHumanDate, formatToTime } from '../../utils/dateHelpers';

export default function AttendanceView() {
  const { showToast } = useToast();
  
  const [attendance, setAttendance] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [queryLoading, setQueryLoading] = useState(false);
  
  // Date filters (defaults: last 7 days to today)
  const [fromDate, setFromDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d.toISOString().substring(0, 10);
  });
  
  const [toDate, setToDate] = useState(() => {
    return new Date().toISOString().substring(0, 10);
  });
  
  const [selectedUser, setSelectedUser] = useState('');

  // Initial load: fetch employees list for select dropdown
  useEffect(() => {
    async function loadEmployees() {
      try {
        const emps = await adminService.getEmployees();
        setEmployees(emps);
      } catch (err) {
        showToast("Failed to load employee list.", "error");
      }
    }
    loadEmployees();
  }, [showToast]);

  const loadAttendanceLogs = async () => {
    setQueryLoading(true);
    try {
      const data = await adminService.getAttendance(selectedUser || null, fromDate, toDate);
      // Sort newest dates first
      const sorted = [...data].sort((a, b) => new Date(b.date) - new Date(a.date));
      setAttendance(sorted);
    } catch (err) {
      showToast("Failed to fetch attendance logs.", "error");
    } finally {
      setQueryLoading(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAttendanceLogs();
  }, [selectedUser, fromDate, toDate]);

  const handleResetFilters = () => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    setFromDate(d.toISOString().substring(0, 10));
    setToDate(new Date().toISOString().substring(0, 10));
    setSelectedUser('');
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
          <h1 className="text-xl font-black text-neutral-800">Attendance Tracker</h1>
          <p className="text-xs text-neutral-500">Monitor clock-in activity across all staff members</p>
        </div>
      </div>

      {/* Filters Card */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3 border-b border-neutral-100">
          <CardTitle className="text-xs font-bold text-neutral-800 uppercase tracking-wider flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-neutral-400" />
            Timesheet Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            {/* Employee Filter */}
            <div className="flex flex-col gap-1">
              <label htmlFor="selectedUser" className="text-xs font-semibold text-neutral-700">
                Filter by Employee
              </label>
              <select
                id="selectedUser"
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                className="rounded-lg border-neutral-300 shadow-sm text-xs focus:ring-primary-500 focus:border-primary-500 py-1.5"
              >
                <option value="">All Employees</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.name} ({emp.employeeId})</option>
                ))}
              </select>
            </div>

            {/* From Date */}
            <div className="flex flex-col gap-1">
              <label htmlFor="fromDate" className="text-xs font-semibold text-neutral-700">
                From Date
              </label>
              <input
                id="fromDate"
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="rounded-lg border-neutral-300 shadow-sm text-xs focus:ring-primary-500 focus:border-primary-500 py-1.5"
              />
            </div>

            {/* To Date */}
            <div className="flex flex-col gap-1">
              <label htmlFor="toDate" className="text-xs font-semibold text-neutral-700">
                To Date
              </label>
              <input
                id="toDate"
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="rounded-lg border-neutral-300 shadow-sm text-xs focus:ring-primary-500 focus:border-primary-500 py-1.5"
              />
            </div>

          </div>

          <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-neutral-100">
            <Button
              onClick={handleResetFilters}
              variant="outline"
              size="sm"
              className="text-[10px] font-bold py-1.5 h-8"
              icon={RefreshCw}
            >
              Reset Filters
            </Button>
            <Button
              onClick={loadAttendanceLogs}
              loading={queryLoading}
              variant="primary"
              size="sm"
              className="text-[10px] font-bold py-1.5 h-8"
            >
              Reload Logs
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Logs Table Card */}
      <Card className="shadow-sm">
        <CardContent className="p-0 overflow-x-auto">
          {queryLoading ? (
            <div className="py-16">
              <Spinner size="md" />
            </div>
          ) : attendance.length > 0 ? (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-neutral-200/80 text-[10px] font-bold text-neutral-400 uppercase tracking-wider bg-neutral-50/50">
                  <th className="py-3 px-6">Date</th>
                  <th className="py-3 px-4">Employee</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Clock In</th>
                  <th className="py-3 px-4">Clock Out</th>
                  <th className="py-3 px-6 text-center">Status Badge</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-xs">
                {attendance.map((log, index) => (
                  <tr key={`${log.userId}-${log.date}-${index}`} className="hover:bg-neutral-50/30 transition-colors">
                    {/* Date */}
                    <td className="py-3.5 px-6 font-bold text-neutral-700">{formatToHumanDate(log.date)}</td>
                    
                    {/* Employee */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <User className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                        <span className="font-bold text-neutral-800">{log.userName}</span>
                      </div>
                    </td>

                    {/* Status Text */}
                    <td className="py-3.5 px-4 font-semibold text-neutral-600 capitalize">{log.status}</td>

                    {/* Clock In */}
                    <td className="py-3.5 px-4 font-semibold text-neutral-600">{formatToTime(log.checkIn)}</td>

                    {/* Clock Out */}
                    <td className="py-3.5 px-4 font-semibold text-neutral-600">
                      {log.checkOut ? formatToTime(log.checkOut) : <span className="text-neutral-400 font-medium">--:--</span>}
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-6 text-center">
                      <StatusBadge status={log.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="py-16 text-center text-xs text-neutral-400 flex flex-col items-center justify-center gap-2">
              <CalendarDays className="w-8 h-8 text-neutral-300" />
              No attendance logs found in date range.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
