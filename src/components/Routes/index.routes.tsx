import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import AdminLayout from "@/layouts/Admin/AdminLayout";
import AuthLayout from "@/layouts/Auth/AuthLayout";
import SettingsPage from "@/pages/Setting";
import StudentForm from "../Students/StudentForm";
import { Staff } from "@/pages/Staff";
import { Payroll } from "@/pages/Payroll";
import { UserManagement } from "@/pages/UserManagement";
import { Fees } from "@/pages/Fees";
import Login from "@/pages/LogIn";
import Students from "@/pages/Students";
import GeneralSettings from "../Settings/GeneralSettings";
import AcademicSettings from "../Settings/AcademicSettings";
import StaffSettings from "../Settings/StaffSettings";
import PayrollSettings from "../Settings/PayrollSettings";
import FeesSettings from "../Settings/FeesSettings";
import { useAppSelector } from "@/redux/hooks/useAppSelector";
import { selectIsAuthenticated } from "@/redux/slices/authSlice";
import PrivateRoute from "./private.routes";
import { useVerifyQuery } from "@/services/AuthService";
import LeaveManagement from "@/components/Leave/LeaveManagement";
import AdminLeaveManagement from "@/pages/AdminLeaveManagement";
import DashboardPage from "@/pages/Dashboard";
import AdminAttendanceView from "../../pages/AdminAttendance";
import StudentAttendanceView from "@/pages/StudentAttendance";
import { Permission } from "@/types/user";
import { LeaveManagementSettings } from "../Settings/LeaveManagementSettings";
import { SearchProvider } from "../Dashboard/searchContext";


export default function RootRoute() {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  /**
   * If localhost has no access_token , then there is no need to make request for verification
   */
  const { data, error, isLoading, isFetching, isSuccess, isError } =
    useVerifyQuery();

  return (
    <SearchProvider>
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Login />} />
        <Route path="/auth" element={<AuthLayout />}>
          <Route path="login" element={<Login />} />
        </Route>

        {/* Protected routes under /d */}
        <Route
          path="/d"
          element={
            <PrivateRoute>
              <AdminLayout />
            </PrivateRoute>
          }
        >
          {/* Dashboard */}
          <Route index element={<DashboardPage />} />

          {/* Students */}
          <Route
            path="students"
            element={
              <PrivateRoute allowedPermissions={[Permission.MANAGE_STUDENTS]}>
                <Students />
              </PrivateRoute>
            }
          />

          {/* Staff */}
          <Route
            path="staff"
            element={
              <PrivateRoute allowedPermissions={[Permission.MANAGE_STAFF]}>
                <Staff />
              </PrivateRoute>
            }
          />

          {/* Payroll */}
          <Route
            path="payroll"
            element={
              <PrivateRoute allowedPermissions={[Permission.MANAGE_PAYROLL]}>
                <Payroll />
              </PrivateRoute>
            }
          />

          {/* Fees */}
          <Route
            path="fee"
            element={
              <PrivateRoute allowedPermissions={[Permission.MANAGE_FEES]}>
                <Fees />
              </PrivateRoute>
            }
          />

          {/* User Management */}
          <Route
            path="users"
            element={
              <PrivateRoute allowedPermissions={[Permission.MANAGE_USERS]}>
                <UserManagement />
              </PrivateRoute>
            }
          />

          {/* Leave */}
          <Route
            path="leave"
            element={
              <PrivateRoute>
                <LeaveManagement
                  initialLeaveRequests={[]}
                  totalLeaves={{ sick: 10, vacation: 15, personal: 5 }}
                  monthlySalary={5000}
                />
              </PrivateRoute>
            }
          />

          {/* Admin Leave Management */}
          <Route
            path="admin-leave-management"
            element={
              <PrivateRoute>
                <AdminLeaveManagement />
              </PrivateRoute>
            }
          />

          {/* Admin Attendance Management */}
          <Route
            path="admin-attendance-mangement"
            element={
              <PrivateRoute>
                <AdminAttendanceView />
              </PrivateRoute>
            }
          />

          {/* Student Attendance */}
          <Route
            path="mark-attendance"
            element={
              <PrivateRoute>
                <StudentAttendanceView />
              </PrivateRoute>
            }
          />

          {/* Settings - nested routes */}
          <Route path="settings" element={<SettingsPage />}>
            <Route index element={<GeneralSettings />} />
            <Route path="general" element={<GeneralSettings />} />
            <Route path="academic" element={<AcademicSettings />} />
            <Route path="staff" element={<StaffSettings />} />
            <Route path="leave" element={<LeaveManagementSettings />} />
            <Route path="payroll" element={<PayrollSettings />} />
            <Route path="fees" element={<FeesSettings />} />
            <Route path="leaves" element={<LeaveManagementSettings />} />
          </Route>
        </Route>
      </Routes>
    </Router>
    </SearchProvider>
  );
}
