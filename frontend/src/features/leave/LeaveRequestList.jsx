import React from 'react';
import StatusBadge from '../../components/ui/StatusBadge';
import { formatToHumanDate, calculateDurationDays } from '../../utils/dateHelpers';
import { Calendar, FileText } from 'lucide-react';

export default function LeaveRequestList({ requests }) {
  return (
    <div className="overflow-x-auto">
      {requests.length > 0 ? (
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-neutral-200 text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
              <th className="pb-3 pr-4">Type</th>
              <th className="pb-3 px-4">Duration</th>
              <th className="pb-3 px-4">Total Days</th>
              <th className="pb-3 px-4">Remarks</th>
              <th className="pb-3 px-4">Status</th>
              <th className="pb-3 pl-4">Reviewer Comment</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 text-xs">
            {requests.map((req) => {
              const days = calculateDurationDays(req.startDate, req.endDate);
              return (
                <tr key={req.id} className="hover:bg-neutral-50/50 transition-colors">
                  {/* Type */}
                  <td className="py-3.5 pr-4 font-bold text-neutral-700 capitalize">
                    {req.leaveType}
                  </td>
                  
                  {/* Duration */}
                  <td className="py-3.5 px-4 font-semibold text-neutral-600">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                      {formatToHumanDate(req.startDate)} - {formatToHumanDate(req.endDate)}
                    </span>
                  </td>
                  
                  {/* Total Days */}
                  <td className="py-3.5 px-4 font-bold text-neutral-800">
                    {days} {days === 1 ? 'day' : 'days'}
                  </td>
                  
                  {/* Remarks */}
                  <td className="py-3.5 px-4 text-neutral-500 max-w-xs truncate" title={req.remarks}>
                    {req.remarks || '--'}
                  </td>
                  
                  {/* Status */}
                  <td className="py-3.5 px-4">
                    <StatusBadge status={req.status} />
                  </td>

                  {/* Reviewer Comment */}
                  <td className="py-3.5 pl-4 text-neutral-500 italic max-w-xs truncate" title={req.reviewerComment}>
                    {req.reviewerComment || <span className="text-neutral-400 not-italic">--</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      ) : (
        <div className="py-12 text-center text-xs text-neutral-400 flex flex-col items-center justify-center gap-2">
          <FileText className="w-8 h-8 text-neutral-300" />
          No leave requests submitted yet.
        </div>
      )}
    </div>
  );
}
