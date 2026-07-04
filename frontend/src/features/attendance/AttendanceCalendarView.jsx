import React, { useState } from 'react';
import { 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  format, 
  isSameDay, 
  startOfWeek, 
  endOfWeek,
  parseISO
} from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import StatusBadge from '../../components/ui/StatusBadge';
import { Calendar, List, CalendarDays } from 'lucide-react';
import { formatToHumanDate, formatToTime } from '../../utils/dateHelpers';

export default function AttendanceCalendarView({ logs }) {
  const [viewType, setViewType] = useState('month'); // 'week' | 'month' | 'list'
  
  const today = new Date();
  
  // Calculate range intervals
  const monthStart = startOfMonth(today);
  const monthEnd = endOfMonth(today);
  const weekStart = startOfWeek(today, { weekStartsOn: 1 }); // Starts Monday
  const weekEnd = endOfWeek(today, { weekStartsOn: 1 });

  const getDays = () => {
    if (viewType === 'month') {
      return eachDayOfInterval({ start: monthStart, end: monthEnd });
    }
    return eachDayOfInterval({ start: weekStart, end: weekEnd });
  };

  const days = getDays();

  // Find attendance record for a given date
  const findRecord = (date) => {
    return logs.find(log => {
      const logDate = parseISO(log.date);
      return isSameDay(logDate, date);
    });
  };

  // Helper to resolve status colors for calendar dot
  const getStatusColor = (status) => {
    if (!status) return 'bg-neutral-100 hover:bg-neutral-200 text-neutral-400';
    switch (status.toLowerCase()) {
      case 'present': return 'bg-emerald-500 text-white';
      case 'absent': return 'bg-rose-500 text-white';
      case 'half-day': return 'bg-amber-500 text-white';
      case 'leave': return 'bg-sky-500 text-white';
      default: return 'bg-neutral-300 text-white';
    }
  };

  return (
    <Card className="shadow-sm">
      <CardHeader className="border-b border-neutral-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <CardTitle className="text-sm font-bold text-neutral-800 flex items-center gap-1.5">
            <CalendarDays className="w-4 h-4 text-primary-500" />
            Attendance History
          </CardTitle>
          <CardDescription>View check-in stats and daily logs</CardDescription>
        </div>

        {/* View Toggle */}
        <div className="flex bg-neutral-100 p-1 rounded-lg self-end sm:self-auto">
          <button
            onClick={() => setViewType('month')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
              viewType === 'month' ? 'bg-white text-neutral-800 shadow-sm' : 'text-neutral-500 hover:text-neutral-800'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            Monthly Grid
          </button>
          <button
            onClick={() => setViewType('week')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
              viewType === 'week' ? 'bg-white text-neutral-800 shadow-sm' : 'text-neutral-500 hover:text-neutral-800'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            Weekly Grid
          </button>
          <button
            onClick={() => setViewType('list')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
              viewType === 'list' ? 'bg-white text-neutral-800 shadow-sm' : 'text-neutral-500 hover:text-neutral-800'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            Detailed Logs
          </button>
        </div>
      </CardHeader>
      
      <CardContent className="pt-6">
        {/* Calendar Grid View (Monthly or Weekly) */}
        {viewType !== 'list' ? (
          <div className="space-y-4">
            {/* Header info */}
            <div className="flex flex-wrap gap-4 text-xs font-semibold justify-center sm:justify-start">
              <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-emerald-500 block" />Present</div>
              <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-rose-500 block" />Absent</div>
              <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-amber-500 block" />Half Day</div>
              <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-sky-500 block" />Leave</div>
              <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-neutral-200 block" />Not Logged</div>
            </div>

            {/* Grid Layout */}
            <div className="grid grid-cols-7 gap-2 text-center border-t border-neutral-100 pt-4">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
                <span key={d} className="text-[10px] font-bold text-neutral-400 uppercase tracking-wide py-1">
                  {d}
                </span>
              ))}

              {/* Pad blank days at the beginning of monthly grids */}
              {viewType === 'month' && Array.from({ length: (monthStart.getDay() + 6) % 7 }).map((_, i) => (
                <div key={`pad-${i}`} className="aspect-square bg-neutral-50/50 rounded-lg border border-dashed border-neutral-100" />
              ))}

              {/* Active Days */}
              {days.map((date) => {
                const record = findRecord(date);
                const isToday = isSameDay(date, today);
                
                return (
                  <div
                    key={date.toString()}
                    className={`aspect-square flex flex-col justify-between p-1.5 rounded-lg border relative group hover:border-primary-300 transition-colors ${
                      isToday ? 'border-primary-500 shadow-sm bg-primary-50/10' : 'border-neutral-100 bg-neutral-50/30'
                    }`}
                  >
                    <span className={`text-[10px] font-bold self-start ${
                      isToday ? 'text-primary-600 bg-primary-50 w-5 h-5 flex items-center justify-center rounded-full' : 'text-neutral-500'
                    }`}>
                      {format(date, 'd')}
                    </span>
                    
                    {record ? (
                      <div className={`w-2.5 h-2.5 rounded-full self-center mb-1.5 ${getStatusColor(record.status)}`} />
                    ) : (
                      <div className="w-2.5 h-2.5 rounded-full self-center mb-1.5 bg-neutral-200" />
                    )}

                    {/* Simple Tooltip on Hover */}
                    {record && (
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 bg-neutral-900 text-white text-[9px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 whitespace-nowrap shadow-lg">
                        {record.status.toUpperCase()} <br />
                        In: {formatToTime(record.checkIn)} <br />
                        Out: {record.checkOut ? formatToTime(record.checkOut) : '--'}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* Detailed Log List View */
          <div className="overflow-x-auto">
            {logs.length > 0 ? (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-neutral-200/80 text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                    <th className="pb-3 pr-4">Date</th>
                    <th className="pb-3 px-4">Status</th>
                    <th className="pb-3 px-4">Clock In</th>
                    <th className="pb-3 px-4">Clock Out</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 text-xs">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-neutral-50/40 transition-colors">
                      <td className="py-3.5 pr-4 font-bold text-neutral-700">{formatToHumanDate(log.date)}</td>
                      <td className="py-3.5 px-4"><StatusBadge status={log.status} /></td>
                      <td className="py-3.5 px-4 font-semibold text-neutral-600">{formatToTime(log.checkIn)}</td>
                      <td className="py-3.5 px-4 font-semibold text-neutral-600">
                        {log.checkOut ? formatToTime(log.checkOut) : <span className="text-neutral-400 font-medium">--:--</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="py-12 text-center text-xs text-neutral-400">
                No attendance logs found in database.
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
