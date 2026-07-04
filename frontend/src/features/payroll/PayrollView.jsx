import React, { useEffect, useState } from 'react';
import useAuth from '../../hooks/useAuth';
import * as payrollService from './payrollService';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import Spinner from '../../components/ui/Spinner';
import Button from '../../components/ui/Button';
import { useToast } from '../../components/ui/Toast';
import { 
  DollarSign, 
  PlusCircle, 
  MinusCircle, 
  TrendingUp, 
  Printer, 
  FileSpreadsheet,
  Coins,
  ArrowDownToLine
} from 'lucide-react';

export default function PayrollView() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [payroll, setPayroll] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPayroll() {
      try {
        const data = await payrollService.getMyPayroll(user.userId);
        setPayroll(data);
      } catch (err) {
        showToast(err.response?.data?.error || "Failed to load payroll details.", "error");
      } finally {
        setLoading(false);
      }
    }
    if (user) {
      loadPayroll();
    }
  }, [user, showToast]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center print:hidden">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!payroll) {
    return (
      <div className="py-16 text-center text-xs text-neutral-400 bg-white rounded-xl border border-neutral-200 print:hidden">
        No payroll record found. Contact HR.
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* SCREEN VIEW (HIDDEN ON PRINT) */}
      <div className="flex items-center justify-between gap-4 print:hidden">
        <div className="flex items-center gap-3">
          <div className="bg-primary-50 p-2 rounded-xl border border-primary-100 text-primary-600">
            <Coins className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-black text-neutral-800">My Compensation</h1>
            <p className="text-xs text-neutral-500">View your basic pay rates, allowances, deductions, and net pay</p>
          </div>
        </div>

        <Button
          onClick={handlePrint}
          variant="outline"
          size="sm"
          className="text-xs font-bold py-2 px-4 shadow-sm"
          icon={Printer}
        >
          Print Payslip
        </Button>
      </div>

      {/* Stats Summary Cards (HIDDEN ON PRINT) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 print:hidden">
        {/* Basic Pay Card */}
        <Card className="border-neutral-200/80 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center justify-between">
              Basic Salary
              <DollarSign className="w-3.5 h-3.5 text-neutral-400" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-black text-neutral-800">
              ${payroll.basicPay.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <p className="text-[10px] text-neutral-400 mt-1">Contractual monthly base pay</p>
          </CardContent>
        </Card>

        {/* Allowances Card */}
        <Card className="border-neutral-200/80 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center justify-between">
              Allowances
              <PlusCircle className="w-3.5 h-3.5 text-emerald-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-black text-emerald-600">
              +${payroll.allowances.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <p className="text-[10px] text-neutral-400 mt-1">Bonuses, travel, and benefits</p>
          </CardContent>
        </Card>

        {/* Deductions Card */}
        <Card className="border-neutral-200/80 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center justify-between">
              Deductions
              <MinusCircle className="w-3.5 h-3.5 text-rose-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-black text-rose-600">
              -${payroll.deductions.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <p className="text-[10px] text-neutral-400 mt-1">Taxes, healthcare, and provident funds</p>
          </CardContent>
        </Card>

        {/* Net Take-Home Card */}
        <Card className="border-primary-100 bg-primary-50/20 shadow-md relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-3 -translate-y-3 w-16 h-16 rounded-full bg-primary-500/10 blur-xl pointer-events-none" />
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold text-primary-600 uppercase tracking-wider flex items-center justify-between">
              Net Take-Home
              <TrendingUp className="w-3.5 h-3.5 text-primary-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-black text-primary-700">
              ${payroll.netPay.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <p className="text-[10px] text-primary-600/70 mt-1">Final disbursed salary amount</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Breakdown Section (HIDDEN ON PRINT) */}
      <Card className="border-neutral-200/80 shadow-sm print:hidden">
        <CardHeader className="border-b border-neutral-100">
          <CardTitle className="text-sm font-bold text-neutral-800">Statement Breakdown</CardTitle>
          <CardDescription>Consolidated ledger breakdown for this pay duration</CardDescription>
        </CardHeader>
        <CardContent className="divide-y divide-neutral-100 p-0">
          <div className="flex justify-between items-center px-6 py-4">
            <span className="text-xs font-semibold text-neutral-600">Contractual Base pay (Basic)</span>
            <span className="text-xs font-bold text-neutral-700">
              ${payroll.basicPay.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <div className="flex justify-between items-center px-6 py-4">
            <span className="text-xs font-semibold text-neutral-600">Travel & Special Allowances</span>
            <span className="text-xs font-bold text-emerald-600">
              +${payroll.allowances.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <div className="flex justify-between items-center px-6 py-4">
            <span className="text-xs font-semibold text-neutral-600">Provident Fund & Deductibles</span>
            <span className="text-xs font-bold text-rose-600">
              -${payroll.deductions.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <div className="flex justify-between items-center px-6 py-4 bg-primary-50/10">
            <span className="text-xs font-bold text-neutral-800">Final Salary Disbursed (Net Pay)</span>
            <span className="text-sm font-black text-primary-700 underline decoration-2 decoration-primary-200">
              ${payroll.netPay.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </CardContent>
      </Card>


      {/* PRINT LAYOUT (VISIBLE ONLY ON PRINT) */}
      <div className="hidden print:block p-10 max-w-4xl mx-auto border-2 border-neutral-800 rounded-xl space-y-8 bg-white text-neutral-900">
        
        {/* Print Header */}
        <div className="flex justify-between items-start border-b-2 border-neutral-800 pb-6">
          <div>
            <h1 className="text-xl font-black tracking-wide text-neutral-800 uppercase">HUMAN RESOURCE MANAGEMENT</h1>
            <p className="text-xs font-bold text-neutral-500 mt-1 uppercase tracking-widest">Official Compensation Statement</p>
          </div>
          <div className="text-right">
            <h2 className="text-sm font-black uppercase text-neutral-800">{user.name}</h2>
            <p className="text-[10px] text-neutral-500 font-bold mt-1">ID: {user.employeeId}</p>
          </div>
        </div>

        {/* Print Meta Details */}
        <div className="grid grid-cols-2 gap-4 text-xs bg-neutral-50 p-4 border border-neutral-200 rounded-lg">
          <div>
            <p className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">Employee Name</p>
            <p className="font-bold text-neutral-800 mt-0.5">{user.name}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">Statement Date</p>
            <p className="font-bold text-neutral-800 mt-0.5">{new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
        </div>

        {/* Print Table */}
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b-2 border-neutral-800 font-bold uppercase tracking-wider text-[10px] text-neutral-400">
              <th className="py-2.5">Salary Description</th>
              <th className="py-2.5 text-right">Disbursement Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200 font-semibold text-neutral-700">
            <tr>
              <td className="py-3">Basic Salary (Monthly contractual rate)</td>
              <td className="py-3 text-right">${payroll.basicPay.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
            </tr>
            <tr>
              <td className="py-3">Allowances (Bonuses, transport, travel allowances)</td>
              <td className="py-3 text-right text-emerald-600">+${payroll.allowances.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
            </tr>
            <tr>
              <td className="py-3">Deductions (Income tax withholdings, healthcare, provident fund)</td>
              <td className="py-3 text-right text-rose-600">-${payroll.deductions.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
            </tr>
            <tr className="border-t-2 border-neutral-800 font-black text-neutral-900 bg-neutral-50 text-sm">
              <td className="py-4 font-black">Net Disbursed Take-Home</td>
              <td className="py-4 text-right font-black border-double border-b-4 border-neutral-800">
                ${payroll.netPay.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Footer verification note */}
        <div className="pt-10 border-t border-dashed border-neutral-300 text-center space-y-2">
          <p className="text-[10px] text-neutral-400 leading-normal">
            This is a system-generated compensation statement. No signature is required.
          </p>
          <p className="text-[9px] text-primary-500 font-bold tracking-widest uppercase">
            VERIFIED SECURE BY HR DIRECTORY
          </p>
        </div>

      </div>

    </div>
  );
}
