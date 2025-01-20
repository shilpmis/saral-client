import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AdminLayout from "@/layouts/Admin/AdminLayout";
import AuthLayout from "@/layouts/Auth/AuthLayout";
import { SidebarProvider } from "../ui/sidebar";
import SettingsPage from "@/pages/Setting";
import StudentListing from "@/pages/Students";
import StudentForm from "../Students/StudentForm";
import LogIn from "@/pages/Login"; 

const RoutesForAuth: any[] = [];
const RoutesForDashboard: any[] = [];

export default function RootRoute() {
  return (
    <Router>
      <Routes>
        <Route path="/auth/" element={<AuthLayout/>}>
          <Route path="login" element={<LogIn/>}></Route>
          <Route path="signin" element={<LogIn />}></Route>
        </Route>

        <Route path="/d/" element={<AdminLayout />}>

          <Route path="students" element={<StudentListing />}></Route>
          <Route path="student/add" element={<StudentForm />}></Route>
          <Route path="student/edit/223" element={<StudentForm />}></Route>

          <Route path="settings" element={<SettingsPage />}></Route>

        </Route>
      </Routes>
    </Router>
  );
}
