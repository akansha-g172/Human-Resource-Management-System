import apiClient from '../../api/apiClient';
import { mockGetEmployees, mockUpdateEmployeeProfile } from '../../mocks/profileMock';
import { mockGetLeaveAdmin, mockUpdateLeaveStatus } from '../../mocks/leaveMock';
import { mockGetAttendanceAdmin } from '../../mocks/attendanceMock';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";

export async function getEmployees() {
  if (USE_MOCK) {
    return mockGetEmployees();
  }
  const response = await apiClient.get('/employees');
  return response.data;
}

export async function updateEmployee(userId, data) {
  if (USE_MOCK) {
    return mockUpdateEmployeeProfile(userId, data);
  }
  const response = await apiClient.patch(`/employees/${userId}`, data);
  return response.data;
}

export async function getLeaves(status) {
  if (USE_MOCK) {
    return mockGetLeaveAdmin(status);
  }
  const url = status ? `/leave?status=${status}` : '/leave';
  const response = await apiClient.get(url);
  return response.data;
}

export async function updateLeaveStatus(id, status, reviewerComment) {
  if (USE_MOCK) {
    return mockUpdateLeaveStatus(id, status, reviewerComment);
  }
  const response = await apiClient.patch(`/leave/${id}/status`, { status, reviewerComment });
  return response.data;
}

export async function getAttendance(userId, fromDate, toDate) {
  if (USE_MOCK) {
    return mockGetAttendanceAdmin(userId, fromDate, toDate);
  }
  
  let url = '/attendance';
  const params = [];
  if (userId) params.push(`userId=${userId}`);
  if (fromDate) params.push(`from=${fromDate}`);
  if (toDate) params.push(`to=${toDate}`);
  if (params.length > 0) {
    url += `?${params.join('&')}`;
  }
  
  const response = await apiClient.get(url);
  return response.data;
}

// Compute dashboard stats for dashboard summaries
export async function getDashboardStats() {
  if (USE_MOCK) {
    const employees = await mockGetEmployees();
    const leaves = await mockGetLeaveAdmin();
    
    const today = new Date().toISOString().substring(0, 10);
    const todayAttendance = await mockGetAttendanceAdmin(null, today, today);
    
    const pendingLeaves = leaves.filter(l => l.status === 'pending').length;
    
    // Count active attendances today
    const presentCount = todayAttendance.filter(a => a.status === 'present' || a.status === 'half-day').length;
    const absentCount = todayAttendance.filter(a => a.status === 'absent').length;
    const leaveCount = todayAttendance.filter(a => a.status === 'leave').length;
    
    // For absent, if they are not in the attendance list at all and not on leave, they might be marked absent
    // But let's keep it simple and base it on records, or (total employees - present - leave)
    const activeCount = employees.length;
    const calculatedAbsent = Math.max(0, activeCount - presentCount - leaveCount);
    
    return {
      totalEmployees: activeCount,
      pendingLeavesCount: pendingLeaves,
      attendanceToday: {
        present: presentCount,
        absent: calculatedAbsent || absentCount,
        leave: leaveCount
      }
    };
  }
  
  // For live API mode: we can fetch employees, leaves, and today's attendance to build stats
  const today = new Date().toISOString().substring(0, 10);
  
  const [empRes, leaveRes, attRes] = await Promise.all([
    apiClient.get('/employees'),
    apiClient.get('/leave?status=pending'),
    apiClient.get(`/attendance?from=${today}&to=${today}`)
  ]);
  
  const totalEmployees = empRes.data.length;
  const pendingLeavesCount = leaveRes.data.length;
  
  const present = attRes.data.filter(a => a.status === 'present' || a.status === 'half-day').length;
  const leave = attRes.data.filter(a => a.status === 'leave').length;
  const absent = Math.max(0, totalEmployees - present - leave);
  
  return {
    totalEmployees,
    pendingLeavesCount,
    attendanceToday: {
      present,
      absent,
      leave
    }
  };
}
