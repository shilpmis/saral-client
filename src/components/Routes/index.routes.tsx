import {
  BrowserRouter as Router,
  Routes,
  Route,
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
import AcademicSettings from "../Settings/AcademicSettings/AcademicSettings";
import StaffSettings from "../Settings/StaffSettings";
import PayrollSettings from "../Settings/PayrollSettings"; 
import { useAppSelector } from "@/redux/hooks/useAppSelector";
import { selectIsAuthenticated } from "@/redux/slices/authSlice";
import PrivateRoute from "./private.routes";
import { useVerifyQuery } from "@/services/AuthService";
import AdminLeaveManagement from "@/pages/AdminLeaveManagement";
import DashboardPage from "@/pages/Dashboard";
import AdminAttendanceView from "../../pages/AdminAttendance";
import StudentAttendanceView from "@/pages/AttendancePage";
import { Permission, UserRole } from "@/types/user";
import { LeaveManagementSettings } from "../Settings/LeaveManagementSettings";
import { SearchProvider } from "../Dashboard/searchContext";
import NotFound from "@/pages/NotFound";
import LeaveDashboardForTeachers from "@/pages/LeaveDashboardForTeachers";
import { Toaster } from "@/components/ui/toaster";
import AdminAdmissonView from "@/pages/AdmissionPage";
import TimeTableManager from "../Settings/TimeTableManager";
import FeeSettings from "../Settings/FeesSettings";
import { StudentFeeDetails } from "../Fees/StudentFee/StudentFeeDetails";
import StudentFeesPanel from "@/pages/StudentFeesPanel";
import PayFeesPanel from "../Fees/PayFees/PayFeesPanel";
import AdmissionSetting from "../Settings/AdmissionSettings/AdmissionSetting";
import QuotaManagement from "../Settings/AdmissionSettings/QuotaSetting";
import SeatsManagement from "../Settings/AdmissionSettings/SeatSetting";

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
                <PrivateRoute
                  allowedRoles={[UserRole.ADMIN, UserRole.PRINCIPAL, UserRole.CLERK, UserRole.HEAD_TEACHER, UserRole.IT_ADMIN]}
                  allowedPermissions={[Permission.MANAGE_STUDENTS]}
                >
                  <Students />
                </PrivateRoute>
              }
            />

            {/* Staff */}
            <Route
              path="staff"
              element={
                <PrivateRoute
                  allowedRoles={[UserRole.ADMIN, UserRole.PRINCIPAL, UserRole.CLERK, UserRole.IT_ADMIN]}
                  allowedPermissions={[Permission.MANAGE_STAFF]}>
                  <Staff />
                </PrivateRoute>
              }
            />

            {/* Payroll */}
            <Route
              path="payroll"
              element={
                <PrivateRoute
                  allowedRoles={[UserRole.ADMIN, UserRole.CLERK, UserRole.IT_ADMIN, UserRole.PRINCIPAL]}
                  allowedPermissions={[Permission.MANAGE_PAYROLL]}>
                  <Payroll />
                </PrivateRoute>
              }
            />

            {/* Fees */}
            <Route
              path="fee"
              element={
                <PrivateRoute
                  allowedRoles={[UserRole.ADMIN, UserRole.CLERK, UserRole.IT_ADMIN, UserRole.PRINCIPAL]}
                  allowedPermissions={[Permission.MANAGE_FEES]}>
                  <Fees />
                </PrivateRoute>
              }
            />

            <Route
              path="payments"
              element={
                <PrivateRoute
                  allowedRoles={[UserRole.ADMIN, UserRole.CLERK]}
                  allowedPermissions={[Permission.MANAGE_FEES]}>
                  <PayFeesPanel />
                </PrivateRoute>
              }
            />

            {/* Fees */}
            <Route
              path="payments/:student_id"
              element={
                <PrivateRoute
                  allowedRoles={[UserRole.ADMIN, UserRole.CLERK]}
                  allowedPermissions={[Permission.MANAGE_FEES]}>
                  <StudentFeesPanel />
                </PrivateRoute>
              }
            />


            {/* User Management */}
            <Route
              path="users"
              element={
                <PrivateRoute
                  allowedRoles={[UserRole.ADMIN, UserRole.IT_ADMIN]}
                  allowedPermissions={[Permission.MANAGE_USERS]}>
                  <UserManagement />
                </PrivateRoute>
              }
            />

            {/* Leave */}
            <Route
              path="leave-applications"
              element={
                <PrivateRoute
                  allowedRoles={[UserRole.SCHOOL_TEACHER ,UserRole.CLERK ]}
                >
                  <LeaveDashboardForTeachers />
                </PrivateRoute>
              }
            />

            {/* Admin Leave Management */}
            <Route
              path="leaves"
              element={
                <PrivateRoute
                  allowedRoles={[UserRole.ADMIN, UserRole.HEAD_TEACHER, UserRole.PRINCIPAL]}
                >
                  <AdminLeaveManagement />
                </PrivateRoute>
              }
            />

            {/* Admin Attendance Management */}
            <Route
              path="attendance"
              element={
                <PrivateRoute
                  allowedRoles={[UserRole.ADMIN, UserRole.PRINCIPAL, UserRole.HEAD_TEACHER]}
                >
                  <AdminAttendanceView />
                </PrivateRoute>
              }
            />

            {/* Student Attendance */}
            <Route
              path="mark-attendance"
              element={
                <PrivateRoute
                  allowedRoles={[UserRole.SCHOOL_TEACHER, UserRole.HEAD_TEACHER]}
                >
                  <StudentAttendanceView />
                </PrivateRoute>
              }
            />

            {/* Student Attendance */}
            <Route
              path="mark-attendance/:classId"
              element={
                <PrivateRoute
                  allowedRoles={[UserRole.SCHOOL_TEACHER, UserRole.HEAD_TEACHER]}
                >
                  <StudentAttendanceView />
                </PrivateRoute>
              }
            />

            <Route
              path="admissions"
              element={
                <PrivateRoute
                  allowedRoles={[UserRole.ADMIN, UserRole.CLERK, UserRole.PRINCIPAL]}
                >
                  <AdminAdmissonView />
                </PrivateRoute>
              }
            />

            {/* Settings - nested routes */}
            <Route path="settings"
              element={
                <PrivateRoute allowedRoles={[UserRole.ADMIN, UserRole.IT_ADMIN]}>
                  <SettingsPage />
                </PrivateRoute>

              }>
              <Route index element={
                <PrivateRoute allowedRoles={[UserRole.ADMIN, UserRole.IT_ADMIN]}>
                  <GeneralSettings />
                </PrivateRoute>
              } />
              <Route path="general" element={
                <PrivateRoute allowedRoles={[UserRole.ADMIN, UserRole.IT_ADMIN]}>
                  <GeneralSettings />
                </PrivateRoute>
              } />
              <Route path="academic" element={
                <PrivateRoute allowedRoles={[UserRole.ADMIN, UserRole.IT_ADMIN]}>
                  <AcademicSettings />
                </PrivateRoute>
              } />
              <Route path="staff" element={
                <PrivateRoute allowedRoles={[UserRole.ADMIN, UserRole.IT_ADMIN]}>
                  <StaffSettings />
                </PrivateRoute>
              } />
              <Route path="leave" element={
                <PrivateRoute allowedRoles={[UserRole.ADMIN, UserRole.IT_ADMIN]}>
                  <LeaveManagementSettings />
                </PrivateRoute>
              } />
              <Route path="payroll" element={
                <PrivateRoute allowedRoles={[UserRole.ADMIN, UserRole.IT_ADMIN]}>
                  <PayrollSettings />
                </PrivateRoute>
              } />
              <Route path="fees" element={
                <PrivateRoute allowedRoles={[UserRole.ADMIN, UserRole.IT_ADMIN]}>
                  <FeeSettings />
                </PrivateRoute>
              } />
              <Route path="leaves" element={
                <PrivateRoute allowedRoles={[UserRole.ADMIN, UserRole.IT_ADMIN]}>
                  <LeaveManagementSettings />
                </PrivateRoute>
              } />
              <Route path="timeTable" element={
                <PrivateRoute allowedRoles={[UserRole.ADMIN, UserRole.IT_ADMIN]}>
                 <TimeTableManager></TimeTableManager>
                </PrivateRoute>
              } />
               <Route path="admission" element={
                <PrivateRoute allowedRoles={[UserRole.ADMIN, UserRole.IT_ADMIN]}>
                 <AdmissionSetting/>
                </PrivateRoute>
              } />
              <Route path="quotas" element={
                <PrivateRoute allowedRoles={[UserRole.ADMIN, UserRole.IT_ADMIN]}>
                 <QuotaManagement/>
                </PrivateRoute>
              } />
              <Route path="quotas" element={
                <PrivateRoute allowedRoles={[UserRole.ADMIN, UserRole.IT_ADMIN]}>
                 <QuotaManagement/>
                </PrivateRoute>
              } />
              <Route path="seats" element={
                <PrivateRoute allowedRoles={[UserRole.ADMIN, UserRole.IT_ADMIN]}>
                 <SeatsManagement/>
                </PrivateRoute>
              } />
            </Route>


          </Route>
          <Route path="*" element={<NotFound />}></Route>
        </Routes>
      </Router>
      <Toaster />
    </SearchProvider>
  );
}


