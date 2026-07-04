import React, { useEffect, useState } from 'react';
import useAuth from '../../hooks/useAuth';
import * as leaveService from './leaveService';
import LeaveRequestList from './LeaveRequestList';
import LeaveCalendar from './LeaveCalendar';
import { leaveApplySchema } from '../../utils/validators';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import { useToast } from '../../components/ui/Toast';
import { CalendarDays, Send } from 'lucide-react';

export default function LeaveApplyForm() {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [requests, setRequests] = useState([]);
  
  const [formData, setFormData] = useState({
    leaveType: 'paid',
    startDate: '',
    endDate: '',
    remarks: '',
  });

  const [errors, setErrors] = useState({});

  const loadRequests = async () => {
    try {
      const data = await leaveService.getLeaveMe(user.userId);
      setRequests(data);
    } catch (err) {
      showToast(err.response?.data?.error || "Failed to load leave history.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadRequests();
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setSubmitLoading(true);

    const validation = leaveApplySchema.safeParse(formData);
    if (!validation.success) {
      const fieldErrors = {};
      validation.error.issues.forEach((issue) => {
        fieldErrors[issue.path[0]] = issue.message;
      });
      setErrors(fieldErrors);
      setSubmitLoading(false);
      showToast("Please check fields for validation errors.", "error");
      return;
    }

    try {
      const res = await leaveService.applyLeave(formData, user.userId);
      showToast("Leave request submitted successfully!", "success");
      
      // Reset form
      setFormData({
        leaveType: 'paid',
        startDate: '',
        endDate: '',
        remarks: '',
      });
      
      // Reload requests
      await loadRequests();
    } catch (err) {
      showToast(err.response?.data?.error || "Failed to submit leave request.", "error");
    } finally {
      setSubmitLoading(false);
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
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="bg-primary-50 p-2 rounded-xl border border-primary-100 text-primary-600">
          <CalendarDays className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-xl font-black text-neutral-800">Leave Management</h1>
          <p className="text-xs text-neutral-500">Apply for time off and review your submission logs</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Leave application form */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm font-bold text-neutral-800">Apply for Leave</CardTitle>
              <CardDescription>Enter details to submit request to your reviewer</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                
                {/* Leave Type */}
                <div className="flex flex-col gap-1">
                  <label htmlFor="leaveType" className="text-xs font-semibold text-neutral-700">
                    Leave Type <span className="text-danger-500">*</span>
                  </label>
                  <select
                    id="leaveType"
                    name="leaveType"
                    value={formData.leaveType}
                    onChange={handleChange}
                    className="w-full rounded-lg border-neutral-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm py-2 px-3 transition-colors"
                  >
                    <option value="paid">Paid Leave</option>
                    <option value="sick">Sick Leave</option>
                    <option value="unpaid">Unpaid Leave</option>
                  </select>
                  {errors.leaveType && (
                    <span className="text-xs text-danger-600 font-medium mt-0.5">{errors.leaveType}</span>
                  )}
                </div>

                {/* Date Range Selection Box (Cohesive group) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-neutral-50/50 p-4 border border-neutral-200/60 rounded-xl">
                  {/* Start Date */}
                  <Input
                    id="startDate"
                    name="startDate"
                    label="Start Date"
                    type="date"
                    value={formData.startDate}
                    onChange={handleChange}
                    error={errors.startDate}
                    required
                  />

                  {/* End Date */}
                  <Input
                    id="endDate"
                    name="endDate"
                    label="End Date"
                    type="date"
                    value={formData.endDate}
                    onChange={handleChange}
                    error={errors.endDate}
                    required
                  />
                </div>

                {/* Remarks */}
                <div className="flex flex-col gap-1">
                  <label htmlFor="remarks" className="text-xs font-semibold text-neutral-700">
                    Remarks / Reason <span className="text-danger-500">*</span>
                  </label>
                  <textarea
                    id="remarks"
                    name="remarks"
                    rows={3}
                    placeholder="Provide details about your request (max 300 characters)..."
                    value={formData.remarks}
                    onChange={handleChange}
                    className={`w-full rounded-lg border-neutral-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm transition-colors py-2 px-3 ${
                      errors.remarks ? 'border-danger-500 focus:border-danger-500 focus:ring-danger-500' : ''
                    }`}
                  />
                  <div className="flex items-center justify-between mt-0.5">
                    {errors.remarks ? (
                      <span className="text-xs text-danger-600 font-medium">{errors.remarks}</span>
                    ) : (
                      <span className="text-[10px] text-neutral-400 font-semibold">Max 300 characters</span>
                    )}
                    <span className="text-[10px] text-neutral-400 font-semibold">
                      {formData.remarks.length}/300
                    </span>
                  </div>
                </div>

                <Button
                  type="submit"
                  loading={submitLoading}
                  className="w-full sm:w-auto font-bold py-2 px-6"
                  icon={Send}
                >
                  Submit Application
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Request logs list */}
          <Card className="shadow-sm">
            <CardHeader className="border-b border-neutral-100">
              <CardTitle className="text-sm font-bold text-neutral-800">My Leave History</CardTitle>
              <CardDescription>All your submitted applications</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <LeaveRequestList requests={requests} />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar helper panels (Calendar schedule) */}
        <div className="lg:col-span-1">
          <LeaveCalendar requests={requests} />
        </div>

      </div>
    </div>
  );
}
