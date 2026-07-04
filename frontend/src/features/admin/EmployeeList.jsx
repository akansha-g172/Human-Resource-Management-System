import React, { useEffect, useState } from 'react';
import * as adminService from './adminService';
import * as authService from '../auth/authService';
import EmployeeDetail from './EmployeeDetail';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import Spinner from '../../components/ui/Spinner';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import EmailInput from '../../components/ui/EmailInput';
import PasswordInput from '../../components/ui/PasswordInput';
import { useToast } from '../../components/ui/Toast';
import { signUpSchema } from '../../utils/validators';
import { 
  Search, 
  ArrowUpDown, 
  Edit2, 
  Users, 
  Plus, 
  FilterX, 
  Mail, 
  Phone, 
  MapPin, 
  Briefcase, 
  DollarSign, 
  CalendarDays,
  Plane,
  Copy,
  Check,
  Sparkles
} from 'lucide-react';
import { formatToHumanDate } from '../../utils/dateHelpers';

export default function EmployeeList() {
  const { showToast } = useToast();
  
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [todayAttendance, setTodayAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  
  // Sorting
  const [sortField, setSortField] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' | 'desc'
  
  // Modal Edit State (Admin editing an employee)
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  // Modal Create State (Admin creating a new employee)
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createData, setCreateData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'employee',
    startDate: new Date().toISOString().substring(0, 10)
  });
  const [createErrors, setCreateErrors] = useState({});
  const [createLoading, setCreateLoading] = useState(false);
  const [generatedEmp, setGeneratedEmp] = useState(null); // stores { employeeId, name } on success
  const [copied, setCopied] = useState(false);

  const loadData = async () => {
    try {
      const todayStr = new Date().toISOString().substring(0, 10);
      const [emps, attToday] = await Promise.all([
        adminService.getEmployees(),
        adminService.getAttendance(null, todayStr, todayStr)
      ]);
      setEmployees(emps);
      setTodayAttendance(attToday);
    } catch (err) {
      showToast("Failed to load employee list.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter and sort whenever dependencies change
  useEffect(() => {
    let result = [...employees];

    // 1. Search term match (name, email, employeeId, jobTitle)
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      result = result.filter(emp => 
        emp.name.toLowerCase().includes(search) ||
        emp.email.toLowerCase().includes(search) ||
        emp.employeeId.toLowerCase().includes(search) ||
        (emp.jobTitle && emp.jobTitle.toLowerCase().includes(search))
      );
    }

    // 2. Department match
    if (deptFilter) {
      result = result.filter(emp => emp.department === deptFilter);
    }

    // 3. Sorting
    result.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      // Handle null cases
      if (aVal === null || aVal === undefined) aVal = '';
      if (bVal === null || bVal === undefined) bVal = '';

      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }

      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    setFilteredEmployees(result);
  }, [employees, searchTerm, deptFilter, sortField, sortOrder]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleEditClick = (emp) => {
    setSelectedEmployee(emp);
    setIsEditOpen(true);
  };

  const handleSaveDetail = async (data) => {
    setSaveLoading(true);
    try {
      const updated = await adminService.updateEmployee(selectedEmployee.id, data);
      
      // Update employee list in local state
      setEmployees(prev => prev.map(emp => emp.id === selectedEmployee.id ? updated : emp));
      setIsEditOpen(false);
      setSelectedEmployee(null);
      showToast("Employee details updated successfully!", "success");
    } catch (err) {
      showToast(err.response?.data?.error || "Failed to update employee details.", "error");
    } finally {
      setSaveLoading(false);
    }
  };

  const handleCreateChange = (e) => {
    const { name, value } = e.target;
    setCreateData(prev => ({ ...prev, [name]: value }));
    if (createErrors[name]) {
      setCreateErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setCreateErrors({});
    setCreateLoading(true);

    const validation = signUpSchema.safeParse(createData);
    if (!validation.success) {
      const errorsMap = {};
      validation.error.issues.forEach(issue => {
        errorsMap[issue.path[0]] = issue.message;
      });
      setCreateErrors(errorsMap);
      setCreateLoading(false);
      showToast("Please fix the validation errors in the creation form.", "error");
      return;
    }

    try {
      // Call standard sign-up backend endpoint
      const result = await authService.signUp(createData);
      setGeneratedEmp(result);
      showToast(`Employee ${result.name} registered successfully!`, "success");
      await loadData(); // refresh employee list
    } catch (err) {
      showToast(err.response?.data?.error || "Failed to register employee.", "error");
    } finally {
      setCreateLoading(false);
    }
  };

  const handleCopyNewId = () => {
    if (!generatedEmp) return;
    navigator.clipboard.writeText(generatedEmp.employeeId);
    setCopied(true);
    showToast("Employee ID copied!", "success");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCloseCreateModal = () => {
    setIsCreateOpen(false);
    setGeneratedEmp(null);
    setCreateData({
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'employee',
      startDate: new Date().toISOString().substring(0, 10)
    });
    setCreateErrors({});
  };

  // Helper to resolve employee status indicators
  const getEmployeeStatus = (empId) => {
    const log = todayAttendance.find(a => a.userId === empId);
    if (!log) return 'absent'; // Default to absent if no log
    return log.status.toLowerCase();
  };

  // Get unique departments for filter dropdown
  const departments = [...new Set(employees.map(e => e.department).filter(Boolean))];

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Top Header Row with New Employee action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-primary-50 p-2 rounded-xl border border-primary-100 text-primary-600">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-black text-neutral-800">Employees Directory</h1>
            <p className="text-xs text-neutral-500">Monitor work status and edit employment records</p>
          </div>
        </div>

        {/* New Employee Action Button */}
        <Button
          onClick={() => setIsCreateOpen(true)}
          variant="primary"
          size="sm"
          className="text-xs font-bold py-2 px-4 shadow-md shadow-primary-200 self-start sm:self-auto"
          icon={Plus}
        >
          New Employee
        </Button>
      </div>

      {/* Search & Filter Controls Card */}
      <Card className="shadow-sm border-neutral-200/80">
        <CardContent className="p-4 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Search bar */}
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Search by name, email, department, job title or employee ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-neutral-300 rounded-lg text-xs focus:ring-primary-500 focus:border-primary-500 transition-colors"
            />
          </div>

          {/* Department Filter and Sorting Header triggers */}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Sort by:</span>
              <select
                value={sortField}
                onChange={(e) => handleSort(e.target.value)}
                className="text-xs border-neutral-300 rounded-lg py-1.5"
              >
                <option value="name">Name</option>
                <option value="employeeId">Employee ID</option>
                <option value="department">Department</option>
                <option value="salary">Salary</option>
                <option value="dateJoined">Start Date</option>
              </select>
            </div>
            
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Dept:</span>
              <select
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
                className="text-xs border-neutral-300 rounded-lg py-1.5 w-32"
              >
                <option value="">All</option>
                {departments.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Employees Card Grid */}
      {filteredEmployees.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEmployees.map((emp) => {
            const status = getEmployeeStatus(emp.id);
            return (
              <Card key={emp.id} hover className="relative flex flex-col justify-between border-neutral-200/60 shadow-sm h-72">
                
                {/* Status Indicator inside right top corner */}
                <div className="absolute top-4 right-4">
                  {status === 'present' || status === 'half-day' ? (
                    <div className="w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white shadow-sm" title="Present Today" />
                  ) : status === 'leave' ? (
                    <div className="p-1 rounded-full bg-sky-100 border border-sky-300 text-sky-600 shadow-sm" title="On Leave Today">
                      <Plane className="w-3.5 h-3.5" />
                    </div>
                  ) : (
                    <div className="w-3.5 h-3.5 rounded-full bg-amber-400 border-2 border-white shadow-sm" title="Absent Today" />
                  )}
                </div>

                {/* Card Header Profile Details */}
                <CardHeader className="pb-3 border-b border-neutral-100 flex flex-row items-center gap-4">
                  <div className="w-12 h-12 rounded-full overflow-hidden border border-neutral-200 bg-neutral-50 flex items-center justify-center font-bold text-neutral-500 uppercase text-sm shrink-0">
                    {emp.photoUrl ? (
                      <img src={emp.photoUrl} alt={emp.name} className="w-full h-full object-cover" />
                    ) : (
                      emp.name.substring(0, 2)
                    )}
                  </div>
                  <div className="min-w-0">
                    <CardTitle className="text-sm font-bold text-neutral-800 truncate pr-6">{emp.name}</CardTitle>
                    <span className="inline-block text-[9px] font-bold text-primary-600 bg-primary-50 px-1.5 py-0.2 rounded mt-0.5 uppercase tracking-wide">
                      {emp.employeeId}
                    </span>
                  </div>
                </CardHeader>

                {/* Card Body Details */}
                <CardContent className="pt-4 flex-1 space-y-2">
                  {/* Job/Dept */}
                  <div className="flex items-center gap-2 text-xs font-semibold text-neutral-600">
                    <Briefcase className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                    <span className="truncate">{emp.jobTitle || 'No Title'} • {emp.department || 'Staff'}</span>
                  </div>
                  
                  {/* Email */}
                  <div className="flex items-center gap-2 text-xs text-neutral-500">
                    <Mail className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                    <span className="truncate">{emp.email}</span>
                  </div>

                  {/* Phone */}
                  <div className="flex items-center gap-2 text-xs text-neutral-500">
                    <Phone className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                    <span>{emp.phone || '--'}</span>
                  </div>

                  {/* Salary / Date */}
                  <div className="flex items-center justify-between border-t border-neutral-100 pt-2 mt-2">
                    <div className="flex items-center gap-1 text-[10px] text-neutral-400 font-bold uppercase">
                      <DollarSign className="w-3 h-3 text-neutral-300" />
                      <span>{emp.salary ? `$${emp.salary.toLocaleString()}` : 'N/A'}</span>
                    </div>
                    <span className="text-[10px] text-neutral-400 font-semibold flex items-center gap-1">
                      <CalendarDays className="w-3 h-3 text-neutral-300" />
                      Joined: {formatToHumanDate(emp.dateJoined)}
                    </span>
                  </div>
                </CardContent>

                {/* Action button */}
                <div className="px-6 py-3 border-t border-neutral-50 bg-neutral-50/50 flex justify-end">
                  <Button
                    onClick={() => handleEditClick(emp)}
                    variant="outline"
                    size="sm"
                    className="text-[10px] font-bold py-1 px-3 h-7 bg-white"
                    icon={Edit2}
                  >
                    Edit Profile
                  </Button>
                </div>

              </Card>
            );
          })}
        </div>
      ) : (
        <div className="py-16 text-center text-xs text-neutral-400 flex flex-col items-center justify-center gap-2 bg-white rounded-xl border border-neutral-200">
          <FilterX className="w-8 h-8 text-neutral-300" />
          No employees matched the current filters.
        </div>
      )}

      {/* Edit Details Modal */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => {
          setIsEditOpen(false);
          setSelectedEmployee(null);
        }}
        title="Edit Employee Contract Details"
      >
        {selectedEmployee && (
          <EmployeeDetail
            employee={selectedEmployee}
            onSave={handleSaveDetail}
            onCancel={() => {
              setIsEditOpen(false);
              setSelectedEmployee(null);
            }}
            loading={saveLoading}
          />
        )}
      </Modal>

      {/* Create New Employee Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={handleCloseCreateModal}
        title="Register New Employee Credentials"
      >
        {generatedEmp ? (
          <div className="space-y-5 py-2">
            <div className="w-12 h-12 bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-2">
              <Check className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h4 className="text-sm font-bold text-neutral-800">Account Created Successfully!</h4>
              <p className="text-xs text-neutral-500 mt-1">Credentials generated for <strong>{generatedEmp.name}</strong></p>
            </div>
            
            <div className="bg-neutral-50 p-4 border border-neutral-200 rounded-xl text-center">
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">Generated Login ID</span>
              <div className="flex items-center justify-center gap-2 mt-2">
                <span className="text-xl font-black text-primary-600 tracking-widest">{generatedEmp.employeeId}</span>
                <button
                  onClick={handleCopyNewId}
                  className="p-1.5 rounded-lg border border-neutral-300 hover:bg-neutral-100 transition-colors"
                  title="Copy ID"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <p className="text-[10px] text-neutral-400 text-center leading-normal">
              Copy this Employee ID and share it with the user. They will need it to log in.
            </p>

            <Button
              onClick={handleCloseCreateModal}
              className="w-full font-bold py-2"
            >
              Complete Registration
            </Button>
          </div>
        ) : (
          <form onSubmit={handleCreateSubmit} className="space-y-4">
            {/* Name */}
            <Input
              id="create_name"
              name="name"
              label="Full Name"
              type="text"
              placeholder="e.g. Alice Smith"
              value={createData.name}
              onChange={handleCreateChange}
              error={createErrors.name}
              required
            />

            {/* Email */}
            <EmailInput
              id="create_email"
              name="email"
              value={createData.email}
              onChange={handleCreateChange}
              error={createErrors.email}
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Role */}
              <div className="flex flex-col gap-1 w-full">
                <label htmlFor="create_role" className="text-xs font-semibold text-neutral-700">
                  Role <span className="text-danger-500">*</span>
                </label>
                <select
                  id="create_role"
                  name="role"
                  value={createData.role}
                  onChange={handleCreateChange}
                  className="rounded-lg border-neutral-300 shadow-sm text-xs focus:ring-primary-500 focus:border-primary-500 py-1.5"
                >
                  <option value="employee">Employee</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>

              {/* Start Date */}
              <Input
                id="create_startDate"
                name="startDate"
                label="Start Date"
                type="date"
                value={createData.startDate}
                onChange={handleCreateChange}
                error={createErrors.startDate}
                required
              />
            </div>

            {/* Password */}
            <PasswordInput
              id="create_password"
              name="password"
              label="Login Password"
              value={createData.password}
              onChange={handleCreateChange}
              error={createErrors.password}
              required
            />

            {/* Confirm Password */}
            <PasswordInput
              id="create_confirmPassword"
              name="confirmPassword"
              label="Confirm Password"
              placeholder="Repeat password"
              value={createData.confirmPassword}
              onChange={handleCreateChange}
              error={createErrors.confirmPassword}
              required
              showCriteria={false}
            />

            <div className="flex items-center gap-3 pt-3 border-t border-neutral-100">
              <Button
                type="submit"
                loading={createLoading}
                className="text-xs font-bold py-2 px-5"
              >
                Register Employee
              </Button>
              <Button
                type="button"
                onClick={handleCloseCreateModal}
                variant="outline"
                disabled={createLoading}
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
