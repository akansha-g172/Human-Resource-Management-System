import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import * as adminService from './adminService';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import Spinner from '../../components/ui/Spinner';
import Button from '../../components/ui/Button';
import { useToast } from '../../components/ui/Toast';
import { 
  Users, 
  CalendarClock, 
  UserCheck, 
  ArrowRight,
  TrendingUp,
  FileSpreadsheet,
  Clock,
  Sparkles
} from 'lucide-react';

export default function AdminDashboard() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    async function loadStats() {
      try {
        const data = await adminService.getDashboardStats();
        setStats(data);
      } catch (err) {
        showToast("Failed to load dashboard metrics.", "error");
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, [showToast]);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!stats) return null;

  const cards = [
    {
      title: 'Total Headcount',
      value: stats.totalEmployees,
      desc: 'Active registered staff members',
      icon: Users,
      color: 'text-primary-600 bg-primary-50 border-primary-100',
    },
    {
      title: 'Pending Leaves',
      value: stats.pendingLeavesCount,
      desc: 'Requests awaiting review',
      icon: CalendarClock,
      color: 'text-amber-600 bg-amber-50 border-amber-100',
      highlight: stats.pendingLeavesCount > 0
    },
    {
      title: 'Present Today',
      value: stats.attendanceToday.present,
      desc: `On Leave: ${stats.attendanceToday.leave} | Absent: ${stats.attendanceToday.absent}`,
      icon: UserCheck,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-100',
    }
  ];

  const quickLinks = [
    {
      title: 'Manage Employees',
      desc: 'Search, review details, or edit payroll / positions of staff.',
      to: '/admin/employees',
      icon: Users,
      buttonText: 'View Directory'
    },
    {
      title: 'Leave Requests',
      desc: 'Review, approve, or reject employee leave applications.',
      to: '/admin/leave',
      icon: CalendarClock,
      buttonText: 'Process Leaves',
      badge: stats.pendingLeavesCount > 0 ? `${stats.pendingLeavesCount} pending` : null
    },
    {
      title: 'Attendance Logs',
      desc: 'Track punch timings and presence histories across dates.',
      to: '/admin/attendance',
      icon: Clock,
      buttonText: 'View Timesheets'
    }
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-neutral-900 to-neutral-800 rounded-2xl p-6 md:p-8 text-white border border-neutral-800 shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 rounded-full bg-primary-600/10 blur-3xl pointer-events-none" />
        <h1 className="text-xl md:text-2xl font-black tracking-wide flex items-center gap-2">
          Admin Control Center
          <Sparkles className="w-5 h-5 text-primary-400" />
        </h1>
        <p className="text-neutral-300 text-xs md:text-sm mt-1 max-w-xl">
          Quickly monitor staff headcount, review time-off applications, and analyze daily check-in patterns.
        </p>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.title} className={`${card.highlight ? 'ring-2 ring-amber-400 border-transparent shadow-md' : 'border-neutral-200/80 shadow-sm'}`}>
              <CardContent className="p-6 flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider block">{card.title}</span>
                  <span className="text-3xl font-black text-neutral-800 block">{card.value}</span>
                  <span className="text-xs text-neutral-500 block">{card.desc}</span>
                </div>
                <div className={`w-12 h-12 rounded-xl ${card.color} border flex items-center justify-center shrink-0`}>
                  <Icon className="w-6 h-6" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Action Sections */}
      <div>
        <h2 className="text-sm font-bold text-neutral-400 uppercase tracking-wider mb-4">Quick Administration Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {quickLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Card key={link.title} hover className="flex flex-col justify-between border-neutral-200/60 shadow-sm">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="w-9 h-9 rounded-lg bg-neutral-100 border border-neutral-200 flex items-center justify-center text-neutral-500">
                      <Icon className="w-5 h-5" />
                    </div>
                    {link.badge && (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold text-amber-700 bg-amber-50 border border-amber-200 uppercase">
                        {link.badge}
                      </span>
                    )}
                  </div>
                  <CardTitle className="text-sm font-bold text-neutral-800 mt-3">{link.title}</CardTitle>
                </CardHeader>
                <CardContent className="pb-4 pt-1 flex-1 flex flex-col justify-between">
                  <p className="text-xs text-neutral-500 leading-relaxed mb-5">
                    {link.desc}
                  </p>
                  <Link to={link.to} className="block w-full">
                    <Button className="w-full text-xs font-semibold py-2" size="sm" variant="outline">
                      {link.buttonText}
                      <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
