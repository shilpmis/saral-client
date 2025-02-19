import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
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
import { useEffect } from "react";
import { useVerifyQuery } from "@/services/AuthService";
import LeaveManagement from "@/components/Leave/LeaveManagement";
import AdminLeaveManagement from "@/pages/AdminLeaveManagement";
import DashboardPage from "@/pages/Dashboard";
import AdminAttendanceView from "../../pages/AdminAttendance";
import StudentAttendanceView from "@/pages/StudentAttendance";

export default function RootRoute() {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  /**
   * If localhost has no access_token , then there is no need to make request for verification
   */
  const { data, error, isLoading, isFetching, isSuccess, isError } =
    useVerifyQuery();

  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<Login />}></Route>

          <Route path="/auth" element={<AuthLayout />}>
            <Route path="login" element={<Login />} />
          </Route>

          <Route path="/d">
            <Route element={<AdminLayout />}>

              <Route path="" element={<DashboardPage />} />

              <Route path="students" element={<Students />} />

              <Route path="staff" element={<Staff />} />
              <Route path="payroll" element={<Payroll />} />

              <Route path="fee" element={<Fees />} />

              <Route path="user-management" element={<UserManagement />} />
              <Route
                path="leave"
                element={
                  <LeaveManagement
                  initialLeaveRequests={[]}
                  totalLeaves={{
                    sick: 10,
                    vacation: 15,
                    personal: 5,
                  }}
                  monthlySalary={5000}
                />
                }
              />
              <Route path="admin-leave-management" element={<AdminLeaveManagement />}/>
              <Route path="admin-attendance-mangement" element={<AdminAttendanceView/>} />
              <Route path="mark-attendance" element={<StudentAttendanceView/>} />

              <Route path="settings" element={<SettingsPage />}>
                <Route path="" element={<GeneralSettings />} />
                <Route path="general" element={<GeneralSettings />} />
                <Route path="academic" element={<AcademicSettings />} />
                <Route path="staff" element={<StaffSettings />} />
                <Route path="payroll" element={<PayrollSettings />} />
                <Route path="fees" element={<FeesSettings />} />
              </Route>
            </Route>
          </Route>
        </Routes>
      </Router>
    </>
  );
}
