import React, { useEffect, useState } from 'react';
import * as payrollService from './payrollService';
import EditSalaryModal from './EditSalaryModal';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import Spinner from '../../components/ui/Spinner';
import Button from '../../components/ui/Button';
import { useToast } from '../../components/ui/Toast';
import { Coins, Edit3, DollarSign, ArrowUpDown } from 'lucide-react';

export default function PayrollAdminTable() {
  const { showToast } = useToast();
  const [payrollList, setPayrollList] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal Edit state
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  useEffect(() => {
    async function fetchPayroll() {
      try {
        const data = await payrollService.getAllPayroll();
        setPayrollList(data);
      } catch (err) {
        showToast(err.response?.data?.error || "Failed to load payroll list.", "error");
      } finally {
        setLoading(false);
      }
    }
    fetchPayroll();
  }, [showToast]);

  const handleEditClick = (record) => {
    setSelectedRecord(record);
    setIsEditOpen(true);
  };

  const handleSavePayroll = async (userId, updatedData) => {
    // Calls payrollService.updatePayroll which returns the updated record
    const result = await payrollService.updatePayroll(userId, updatedData);
    
    // Update local list state in place as requested by the prompt
    setPayrollList(prev => prev.map(rec => {
      if (rec.userId === userId) {
        return {
          ...rec,
          basicPay: result.basicPay,
          allowances: result.allowances,
          deductions: result.deductions,
          netPay: result.netPay
        };
      }
      return rec;
    }));

    showToast("Payroll updated successfully!", "success");
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
      <div className="flex items-center gap-3">
        <div className="bg-primary-50 p-2 rounded-xl border border-primary-100 text-primary-600">
          <Coins className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-xl font-black text-neutral-800">Payroll Directory</h1>
          <p className="text-xs text-neutral-500">Edit employee pay bands, bonuses, and deductibles</p>
        </div>
      </div>

      <Card className="shadow-sm border-neutral-200/80 overflow-hidden">
        <CardHeader className="bg-neutral-50/20 border-b border-neutral-100">
          <CardTitle className="text-sm font-bold text-neutral-800">Salary Ledgers</CardTitle>
          <CardDescription>Manage monthly wage rates across the organization</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-neutral-50/50 border-b border-neutral-200/60 text-neutral-400 font-bold uppercase text-[10px] tracking-wider">
                  <th className="px-6 py-3.5">Employee Name</th>
                  <th className="px-6 py-3.5">Employee ID</th>
                  <th className="px-6 py-3.5 text-right">Basic Salary</th>
                  <th className="px-6 py-3.5 text-right">Allowances</th>
                  <th className="px-6 py-3.5 text-right">Deductions</th>
                  <th className="px-6 py-3.5 text-right font-black text-neutral-800">Net Take-Home</th>
                  <th className="px-6 py-3.5 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-neutral-700 font-semibold">
                {payrollList.map(record => (
                  <tr key={record.userId} className="hover:bg-neutral-50/40 transition-colors">
                    <td className="px-6 py-4 font-bold text-neutral-800">{record.userName}</td>
                    <td className="px-6 py-4">
                      <span className="inline-block text-[9px] font-bold text-neutral-500 bg-neutral-100 px-1.5 py-0.5 rounded border border-neutral-200/60 uppercase">
                        {record.employeeId}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      ${record.basicPay.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 text-right text-emerald-600">
                      +${record.allowances.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 text-right text-rose-600">
                      -${record.deductions.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 text-right font-black text-primary-700">
                      ${record.netPay.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Button
                        onClick={() => handleEditClick(record)}
                        variant="outline"
                        size="sm"
                        className="text-[10px] font-bold py-1 px-3.5 h-7 bg-white inline-flex items-center gap-1 border-neutral-300"
                        icon={Edit3}
                      >
                        Edit
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Form Modal */}
      {selectedRecord && (
        <EditSalaryModal
          isOpen={isEditOpen}
          onClose={() => {
            setIsEditOpen(false);
            setSelectedRecord(null);
          }}
          employee={selectedRecord}
          onSave={handleSavePayroll}
        />
      )}
    </div>
  );
}
