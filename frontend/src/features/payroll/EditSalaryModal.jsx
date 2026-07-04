import React, { useState, useEffect } from 'react';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { payrollUpdateSchema } from '../../utils/validators';
import { useToast } from '../../components/ui/Toast';
import { DollarSign, Wallet, ArrowRight, ShieldAlert } from 'lucide-react';

export default function EditSalaryModal({ isOpen, onClose, employee, onSave }) {
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    basicPay: '0',
    allowances: '0',
    deductions: '0'
  });
  
  const [errors, setErrors] = useState({});
  const [serverErr, setServerErr] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (employee) {
      setFormData({
        basicPay: String(employee.basicPay ?? 0),
        allowances: String(employee.allowances ?? 0),
        deductions: String(employee.deductions ?? 0)
      });
      setErrors({});
      setServerErr(null);
    }
  }, [employee, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear validation error when editing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    setServerErr(null);
  };

  // Live previews
  const bp = Number(formData.basicPay) || 0;
  const al = Number(formData.allowances) || 0;
  const dd = Number(formData.deductions) || 0;
  const liveNetPay = bp + al - dd;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setServerErr(null);

    const validation = payrollUpdateSchema.safeParse(formData);
    if (!validation.success) {
      const fieldErrors = {};
      validation.error.issues.forEach(issue => {
        fieldErrors[issue.path[0]] = issue.message;
      });
      setErrors(fieldErrors);
      showToast("Please correct the form fields before saving.", "error");
      return;
    }

    setLoading(true);
    try {
      await onSave(employee.userId, validation.data);
      onClose();
    } catch (err) {
      // Handle inline server 400 error message as requested
      setServerErr(err.response?.data?.error || "An unexpected error occurred while saving.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Adjust Employee Salary Structure"
    >
      <div className="space-y-4">
        <div className="bg-neutral-50 p-3 rounded-lg border border-neutral-200 text-xs">
          <p className="text-neutral-500 font-semibold uppercase text-[9px] tracking-wider">Employee Name</p>
          <p className="font-bold text-neutral-800 text-sm mt-0.5">{employee?.userName}</p>
          <span className="inline-block text-[9px] font-bold text-primary-600 bg-primary-50 px-1.5 py-0.5 rounded mt-1.5">
            ID: {employee?.employeeId}
          </span>
        </div>

        {/* Inline Server Error display */}
        {serverErr && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-start gap-2 text-rose-600 text-xs font-semibold animate-shake">
            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{serverErr}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Basic Salary */}
          <Input
            id="basicPay"
            name="basicPay"
            label="Basic Contractual Salary ($)"
            type="number"
            step="0.01"
            placeholder="e.g. 5000.00"
            value={formData.basicPay}
            onChange={handleChange}
            error={errors.basicPay}
            required
          />

          {/* Allowances */}
          <Input
            id="allowances"
            name="allowances"
            label="Total Special Allowances ($)"
            type="number"
            step="0.01"
            placeholder="e.g. 1500.00"
            value={formData.allowances}
            onChange={handleChange}
            error={errors.allowances}
            required
          />

          {/* Deductions */}
          <Input
            id="deductions"
            name="deductions"
            label="Total Salary Deductibles ($)"
            type="number"
            step="0.01"
            placeholder="e.g. 450.00"
            value={formData.deductions}
            onChange={handleChange}
            error={errors.deductions}
            required
          />

          {/* Live Preview Take-home Card */}
          <div className="bg-primary-50/30 p-4 border border-primary-100 rounded-xl flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[9px] font-bold text-primary-600 uppercase tracking-widest block">Live Calculated Net Pay</span>
              <span className="text-xs text-neutral-400">Sum = Basic + Allowances − Deductions</span>
            </div>
            <div className="text-right">
              <span className={`text-xl font-black ${liveNetPay < 0 ? 'text-rose-600' : 'text-primary-700'}`}>
                ${liveNetPay.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-3 pt-3 border-t border-neutral-100">
            <Button
              type="submit"
              loading={loading}
              disabled={loading}
              className="text-xs font-bold py-2 px-5"
            >
              Update Salary Structure
            </Button>
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              disabled={loading}
              className="text-xs font-semibold py-2 px-5"
            >
              Cancel
            </Button>
          </div>

        </form>
      </div>
    </Modal>
  );
}
