import React, { useEffect, useState } from 'react';
import * as adminService from './adminService';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import Spinner from '../../components/ui/Spinner';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import StatusBadge from '../../components/ui/StatusBadge';
import { useToast } from '../../components/ui/Toast';
import { 
  CalendarDays, 
  Check, 
  X, 
  MessageSquare,
  CalendarCheck,
  FileClock
} from 'lucide-react';
import { formatToHumanDate, calculateDurationDays } from '../../utils/dateHelpers';

export default function LeaveApprovals() {
  const { showToast } = useToast();
  
  const [leaves, setLeaves] = useState([]);
  const [filteredLeaves, setFilteredLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Status filter: '', 'pending', 'approved', 'rejected'
  const [statusFilter, setStatusFilter] = useState('pending');
  
  // Review Action modal state
  const [activeRequest, setActiveRequest] = useState(null);
  const [actionType, setActionType] = useState(null); // 'approved' | 'rejected'
  const [comment, setComment] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const loadLeaves = async () => {
    try {
      const data = await adminService.getLeaves();
      setLeaves(data);
    } catch (err) {
      showToast("Failed to load leave requests.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeaves();
  }, []);

  useEffect(() => {
    if (statusFilter) {
      setFilteredLeaves(leaves.filter(l => l.status === statusFilter));
    } else {
      setFilteredLeaves(leaves);
    }
  }, [leaves, statusFilter]);

  const handleOpenActionModal = (request, type) => {
    setActiveRequest(request);
    setActionType(type);
    setComment('');
  };

  const handleCloseModal = () => {
    setActiveRequest(null);
    setActionType(null);
    setComment('');
  };

  const handleProcessRequest = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    
    try {
      const updated = await adminService.updateLeaveStatus(
        activeRequest.id, 
        actionType, 
        comment
      );
      
      // Update local state list
      setLeaves(prev => prev.map(l => l.id === activeRequest.id ? updated : l));
      showToast(`Leave request ${actionType} successfully!`, "success");
      handleCloseModal();
    } catch (err) {
      showToast(err.response?.data?.error || "Failed to process leave request.", "error");
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
          <CalendarCheck className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-xl font-black text-neutral-800">Leave Approvals</h1>
          <p className="text-xs text-neutral-500">Review and authorize staff leave applications</p>
        </div>
      </div>

      {/* Tabs / Filters Card */}
      <Card className="shadow-sm">
        <CardContent className="p-3 flex items-center justify-between">
          <div className="flex bg-neutral-100 p-1 rounded-lg">
            <button
              onClick={() => setStatusFilter('pending')}
              className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${
                statusFilter === 'pending' ? 'bg-white text-neutral-800 shadow-sm' : 'text-neutral-500 hover:text-neutral-800'
              }`}
            >
              Pending Approval
            </button>
            <button
              onClick={() => setStatusFilter('approved')}
              className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${
                statusFilter === 'approved' ? 'bg-white text-neutral-800 shadow-sm' : 'text-neutral-500 hover:text-neutral-800'
              }`}
            >
              Approved
            </button>
            <button
              onClick={() => setStatusFilter('rejected')}
              className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${
                statusFilter === 'rejected' ? 'bg-white text-neutral-800 shadow-sm' : 'text-neutral-500 hover:text-neutral-800'
              }`}
            >
              Rejected
            </button>
            <button
              onClick={() => setStatusFilter('')}
              className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${
                statusFilter === '' ? 'bg-white text-neutral-800 shadow-sm' : 'text-neutral-500 hover:text-neutral-800'
              }`}
            >
              All Requests
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Table Card */}
      <Card className="shadow-sm">
        <CardContent className="p-0 overflow-x-auto">
          {filteredLeaves.length > 0 ? (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-neutral-200/80 text-[10px] font-bold text-neutral-400 uppercase tracking-wider bg-neutral-50/50">
                  <th className="py-3 px-6">Employee</th>
                  <th className="py-3 px-4">Leave Type</th>
                  <th className="py-3 px-4">Duration</th>
                  <th className="py-3 px-4">Total Days</th>
                  <th className="py-3 px-4">Remarks</th>
                  <th className="py-3 px-4">Submitted At</th>
                  {statusFilter !== 'pending' && <th className="py-3 px-4">Status</th>}
                  {statusFilter === 'pending' ? (
                    <th className="py-3 px-6 text-center">Review Actions</th>
                  ) : (
                    <th className="py-3 px-6">Reviewer Notes</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-xs">
                {filteredLeaves.map((req) => {
                  const days = calculateDurationDays(req.startDate, req.endDate);
                  return (
                    <tr key={req.id} className="hover:bg-neutral-50/30 transition-colors">
                      {/* Employee name */}
                      <td className="py-3.5 px-6 font-bold text-neutral-700">
                        <div>
                          <p>{req.userName}</p>
                          <span className="text-[9px] text-neutral-400 font-semibold">{req.userId}</span>
                        </div>
                      </td>

                      {/* Type */}
                      <td className="py-3.5 px-4 font-bold capitalize text-neutral-600">{req.leaveType}</td>

                      {/* Range */}
                      <td className="py-3.5 px-4 font-semibold text-neutral-500">
                        {formatToHumanDate(req.startDate)} - {formatToHumanDate(req.endDate)}
                      </td>

                      {/* Days */}
                      <td className="py-3.5 px-4 font-bold text-neutral-800">{days} days</td>

                      {/* Reason remarks */}
                      <td className="py-3.5 px-4 text-neutral-500 max-w-xs truncate" title={req.remarks}>
                        "{req.remarks}"
                      </td>

                      {/* Created date */}
                      <td className="py-3.5 px-4 text-neutral-400 font-semibold">{formatToHumanDate(req.createdAt)}</td>

                      {/* Status (If not filtered by tab) */}
                      {statusFilter !== 'pending' && (
                        <td className="py-3.5 px-4">
                          <StatusBadge status={req.status} />
                        </td>
                      )}

                      {/* Actions or Notes */}
                      {req.status === 'pending' ? (
                        <td className="py-3.5 px-6">
                          <div className="flex items-center justify-center gap-2">
                            <Button
                              onClick={() => handleOpenActionModal(req, 'approved')}
                              variant="success"
                              size="sm"
                              className="text-[10px] font-bold py-1 px-2.5 h-7"
                              icon={Check}
                            >
                              Approve
                            </Button>
                            <Button
                              onClick={() => handleOpenActionModal(req, 'rejected')}
                              variant="danger"
                              size="sm"
                              className="text-[10px] font-bold py-1 px-2.5 h-7"
                              icon={X}
                            >
                              Reject
                            </Button>
                          </div>
                        </td>
                      ) : (
                        <td className="py-3.5 px-6 text-neutral-500 italic max-w-xs truncate" title={req.reviewerComment}>
                          {req.reviewerComment || <span className="text-neutral-400 not-italic">--</span>}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="py-16 text-center text-xs text-neutral-400 flex flex-col items-center justify-center gap-2">
              <FileClock className="w-8 h-8 text-neutral-300" />
              No leave requests found matching this status.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Approve/Reject Modal Drawer */}
      <Modal
        isOpen={!!activeRequest}
        onClose={handleCloseModal}
        title={actionType === 'approved' ? 'Approve Time-Off Request' : 'Reject Time-Off Request'}
      >
        {activeRequest && (
          <form onSubmit={handleProcessRequest} className="space-y-4">
            <div className="text-xs bg-neutral-50 p-3 rounded-lg border border-neutral-100">
              <span className="block font-bold text-neutral-500 uppercase text-[9px] tracking-wide">Request Details</span>
              <p className="mt-1 text-neutral-800 font-bold">
                {activeRequest.userName} — <span className="capitalize">{activeRequest.leaveType} leave</span>
              </p>
              <p className="text-neutral-500 font-semibold mt-0.5">
                {formatToHumanDate(activeRequest.startDate)} to {formatToHumanDate(activeRequest.endDate)} ({calculateDurationDays(activeRequest.startDate, activeRequest.endDate)} days)
              </p>
              <p className="text-neutral-400 italic mt-2 bg-white px-2 py-1.5 rounded border border-neutral-200">
                "{activeRequest.remarks}"
              </p>
            </div>

            {/* Review Comment */}
            <div className="flex flex-col gap-1">
              <label htmlFor="comment" className="text-xs font-semibold text-neutral-700 flex items-center gap-1">
                <MessageSquare className="w-3.5 h-3.5 text-neutral-400" />
                Reviewer Note / Comment
              </label>
              <textarea
                id="comment"
                name="comment"
                rows={3}
                placeholder="Add optional notes explaining your approval/rejection decision..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full rounded-lg border-neutral-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-xs py-2 px-3"
              />
            </div>

            <div className="flex items-center gap-3 pt-3 border-t border-neutral-100">
              <Button
                type="submit"
                loading={actionLoading}
                variant={actionType === 'approved' ? 'success' : 'danger'}
                className="text-xs font-bold py-2 px-5"
              >
                {actionType === 'approved' ? 'Confirm Approval' : 'Confirm Rejection'}
              </Button>
              <Button
                type="button"
                onClick={handleCloseModal}
                variant="outline"
                disabled={actionLoading}
                className="text-xs font-semibold py-2 px-5"
              >
                Cancel
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
