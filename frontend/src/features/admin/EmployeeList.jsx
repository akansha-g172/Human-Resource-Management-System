import React, { useEffect, useState } from 'react';
import * as adminService from './adminService';
import EmployeeDetail from './EmployeeDetail';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import Spinner from '../../components/ui/Spinner';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import { useToast } from '../../components/ui/Toast';
import { 
  Search, 
  ArrowUpDown, 
  Edit2, 
  Users, 
  Plus, 
  FilterX, 
  UserSquare2 
} from 'lucide-react';
import { formatToHumanDate } from '../../utils/dateHelpers';

export default function EmployeeList() {
  const { showToast } = useToast();
  
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  
  // Sorting
  const [sortField, setSortField] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' | 'desc'
  
  // Modal Edit State
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  const loadEmployees = async () => {
    try {
      const data = await adminService.getEmployees();
      setEmployees(data);
    } catch (err) {
      showToast("Failed to load employees.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmployees();
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
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <div className="bg-primary-50 p-2 rounded-xl border border-primary-100 text-primary-600">
          <Users className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-xl font-black text-neutral-800">Employee Directory</h1>
          <p className="text-xs text-neutral-500">Manage all registered employees and positions</p>
        </div>
      </div>

      {/* Filters Card */}
      <Card className="shadow-sm">
        <CardContent className="p-4 flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Search Input */}
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Search by name, email, job title or employee ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-neutral-300 rounded-lg text-xs focus:ring-primary-500 focus:border-primary-500 transition-colors"
            />
          </div>

          {/* Department Filter */}
          <div className="flex items-center gap-2 w-full md:w-auto self-end md:self-auto">
            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider whitespace-nowrap">Department:</span>
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="w-full md:w-48 text-xs border-neutral-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 py-1.5"
            >
              <option value="">All Departments</option>
              {departments.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

        </CardContent>
      </Card>

      {/* Directory Table Card */}
      <Card className="shadow-sm">
        <CardContent className="p-0 overflow-x-auto">
          {filteredEmployees.length > 0 ? (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-neutral-200/80 text-[10px] font-bold text-neutral-400 uppercase tracking-wider bg-neutral-50/50">
                  <th className="py-3 px-6 cursor-pointer hover:text-neutral-700" onClick={() => handleSort('employeeId')}>
                    <span className="flex items-center gap-1">Employee ID <ArrowUpDown className="w-3 h-3" /></span>
                  </th>
                  <th className="py-3 px-4 cursor-pointer hover:text-neutral-700" onClick={() => handleSort('name')}>
                    <span className="flex items-center gap-1">Name <ArrowUpDown className="w-3 h-3" /></span>
                  </th>
                  <th className="py-3 px-4 cursor-pointer hover:text-neutral-700" onClick={() => handleSort('department')}>
                    <span className="flex items-center gap-1">Department <ArrowUpDown className="w-3 h-3" /></span>
                  </th>
                  <th className="py-3 px-4">Job Title</th>
                  <th className="py-3 px-4 cursor-pointer hover:text-neutral-700" onClick={() => handleSort('salary')}>
                    <span className="flex items-center gap-1">Salary <ArrowUpDown className="w-3 h-3" /></span>
                  </th>
                  <th className="py-3 px-4">Start Date</th>
                  <th className="py-3 px-6 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-xs">
                {filteredEmployees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-neutral-50/30 transition-colors">
                    {/* ID */}
                    <td className="py-3.5 px-6 font-bold text-primary-600">{emp.employeeId}</td>
                    
                    {/* Name */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-full bg-neutral-100 flex items-center justify-center font-bold text-neutral-600 uppercase text-[10px] shrink-0 border border-neutral-200">
                          {emp.name.substring(0, 2)}
                        </div>
                        <div>
                          <p className="font-bold text-neutral-700 leading-3">{emp.name}</p>
                          <span className="text-[10px] text-neutral-400 font-medium">{emp.email}</span>
                        </div>
                      </div>
                    </td>

                    {/* Department */}
                    <td className="py-3.5 px-4 font-semibold text-neutral-600">{emp.department || '--'}</td>

                    {/* Job Title */}
                    <td className="py-3.5 px-4 font-medium text-neutral-500">{emp.jobTitle || '--'}</td>

                    {/* Salary */}
                    <td className="py-3.5 px-4 font-bold text-neutral-700">
                      {emp.salary ? `$${emp.salary.toLocaleString()}` : '--'}
                    </td>

                    {/* Joined Date */}
                    <td className="py-3.5 px-4 text-neutral-400 font-semibold">{formatToHumanDate(emp.dateJoined)}</td>

                    {/* Actions */}
                    <td className="py-3.5 px-6 text-center">
                      <Button
                        onClick={() => handleEditClick(emp)}
                        variant="outline"
                        size="sm"
                        className="text-[10px] font-bold py-1 px-2.5 h-7"
                        icon={Edit2}
                      >
                        Edit
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="py-16 text-center text-xs text-neutral-400 flex flex-col items-center justify-center gap-2">
              <FilterX className="w-8 h-8 text-neutral-300" />
              No employees matched the search filters.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Employee Modal */}
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
    </div>
  );
}
