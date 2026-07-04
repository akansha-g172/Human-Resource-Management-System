import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './components/ui/Toast';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './components/layout/DashboardLayout';

// Auth feature
import SignIn from './features/auth/SignIn';
import SignUp from './features/auth/SignUp';

// Employee features
import EmployeeDashboard from './features/dashboard/EmployeeDashboard';
import ProfileView from './features/profile/ProfileView';
import AttendanceDashboard from './features/attendance/AttendanceDashboard';
import LeaveApplyForm from './features/leave/LeaveApplyForm';

// Admin features
import AdminDashboard from './features/admin/AdminDashboard';
import EmployeeList from './features/admin/EmployeeList';
import LeaveApprovals from './features/admin/LeaveApprovals';
import AttendanceView from './features/admin/AttendanceView';

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <Routes>
            {/* Public auth routes */}
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />

            {/* Employee Portal routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute allowedRoles={['employee']}>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<EmployeeDashboard />} />
              <Route path="profile" element={<ProfileView />} />
              <Route path="attendance" element={<AttendanceDashboard />} />
              <Route path="leave" element={<LeaveApplyForm />} />
            </Route>

            {/* Admin Portal routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/admin/employees" replace />} />
              <Route path="employees" element={<EmployeeList />} />
              <Route path="leave" element={<LeaveApprovals />} />
              <Route path="attendance" element={<AttendanceView />} />
            </Route>

            {/* Fallback routes */}
            <Route path="*" element={<Navigate to="/signin" replace />} />
          </Routes>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
