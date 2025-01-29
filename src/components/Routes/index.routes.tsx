import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AdminLayout from "@/layouts/Admin/AdminLayout";
import AuthLayout from "@/layouts/Auth/AuthLayout";
import SettingsPage from "@/pages/Setting";
import StudentListing from "@/pages/Students";
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

const RoutesForAuth: any[] = [];
const RoutesForDashboard: any[] = [];

export default function RootRoute() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />

        <Route path="/auth" element={<AuthLayout />}>
          <Route path="login" element={<Login />} />
        </Route>

        <Route path="/d/" element={<AdminLayout />}>

          <Route path="students" element={<Students />}></Route>
          <Route path="student/add" element={<StudentForm />}></Route>
          <Route path="student/edit/2" element={<StudentForm />}></Route>

          <Route path="staff" element={<Staff />}></Route>

          <Route path="payroll" element={<Payroll />}></Route>

          <Route path="fee" element={<Fees />}></Route>

          <Route path="user-management" element={<UserManagement />} />

          <Route path="settings/" element={<SettingsPage />}>
            <Route path="general" element={<GeneralSettings />} />
            <Route path="academic" element={<AcademicSettings />} />
            <Route path="staff" element={<StaffSettings />} />
            <Route path="payroll" element={<PayrollSettings />} />
            <Route path="fees" element={<FeesSettings />} />
          </Route>

        </Route>
      </Routes>
    </Router>
  );
}
