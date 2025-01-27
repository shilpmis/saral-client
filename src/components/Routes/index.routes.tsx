import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AdminLayout from "@/layouts/Admin/AdminLayout";
import AuthLayout from "@/layouts/Auth/AuthLayout";
import SettingsPage from "@/pages/Setting";
import StudentListing from "@/pages/Students";
import StudentForm from "../Students/StudentForm";
import { Staff } from "@/pages/Staff";
import { Payroll } from "@/pages/Payroll";
import { UserManagement } from "@/pages/UserManagement";
import { FeeManagement } from "@/pages/FeeMangement";
import Login from "@/pages/LogIn";
import Students from "@/pages/Students";

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

          <Route path="fee" element={<FeeManagement />}></Route>

          <Route path="user-management" element={<UserManagement />} />
          <Route path="settings" element={<SettingsPage />}></Route>

        </Route>
      </Routes>
    </Router>
  );
}
