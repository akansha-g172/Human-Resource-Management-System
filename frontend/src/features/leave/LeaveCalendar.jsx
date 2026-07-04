import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Calendar, CheckCircle } from 'lucide-react';
import { formatToHumanDate, calculateDurationDays } from '../../utils/dateHelpers';

export default function LeaveCalendar({ requests }) {
  // Filter for approved and upcoming/current leaves
  const todayStr = new Date().toISOString().substring(0, 10);
  const approvedLeaves = requests
    .filter(r => r.status === 'approved' && r.endDate >= todayStr)
    .sort((a, b) => new Date(a.startDate) - new Date(b.startDate));

  return (
    <Card className="border-neutral-200/80 shadow-sm h-full">
      <CardHeader className="bg-neutral-50/30">
        <CardTitle className="text-sm font-bold text-neutral-800 flex items-center gap-1.5">
          <Calendar className="w-4 h-4 text-primary-500" />
          Upcoming Approved Leave
        </CardTitle>
        <CardDescription>Scheduled time off</CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        {approvedLeaves.length > 0 ? (
          <div className="space-y-3">
            {approvedLeaves.map((leave) => {
              const days = calculateDurationDays(leave.startDate, leave.endDate);
              return (
                <div 
                  key={leave.id} 
                  className="flex items-start gap-3 p-3 rounded-lg border border-emerald-100 bg-emerald-50/20"
                >
                  <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-neutral-800 capitalize">
                      {leave.leaveType} Leave
                    </span>
                    <span className="block text-[10px] text-neutral-500 mt-0.5">
                      {formatToHumanDate(leave.startDate)} to {formatToHumanDate(leave.endDate)}
                    </span>
                    <span className="inline-block mt-1 text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100 uppercase">
                      {days} {days === 1 ? 'Day' : 'Days'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-8 text-center text-xs text-neutral-400">
            No upcoming approved leaves.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
