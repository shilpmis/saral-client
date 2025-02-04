import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"

import AdminLayout from "@/layouts/Admin/AdminLayout"
import AuthLayout from "@/layouts/Auth/AuthLayout"
import SettingsPage from "@/pages/Setting"
import StudentForm from "../Students/StudentForm"
import { Staff } from "@/pages/Staff"
import { Payroll } from "@/pages/Payroll"
import { UserManagement } from "@/pages/UserManagement"
import { Fees } from "@/pages/Fees"
import Login from "@/pages/LogIn"
import Students from "@/pages/Students"
import GeneralSettings from "../Settings/GeneralSettings"
import AcademicSettings from "../Settings/AcademicSettings"
import StaffSettings from "../Settings/StaffSettings"
import PayrollSettings from "../Settings/PayrollSettings"
import FeesSettings from "../Settings/FeesSettings"
import { useAppSelector } from "@/redux/hooks/useAppSelector"
import { selectIsAuthenticated } from "@/redux/slices/authSlice"
import PrivateRoute from "./private.routes"
import { useEffect } from "react"

export default function RootRoute() {
  const isAuthenticated = useAppSelector(selectIsAuthenticated)

  useEffect(()=> {
   console.log("isAuthenticated", isAuthenticated)
  }, [isAuthenticated])
  
  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={isAuthenticated ? <Navigate to="/d/staff" replace /> : <Navigate to="/auth/login" replace />}
        />

        <Route path="/auth" element={<AuthLayout />}>
          <Route path="login" element={<Login />} />
        </Route>

        <Route path="/d" >
          <Route element={<AdminLayout />}>
            <Route path="students" element={<Students />} />
            {/* <Route path="student/add" element={<StudentForm />} />
            <Route path="student/edit/:id" element={<StudentForm />} /> */}
            <Route path="staff" element={<Staff />} />
            <Route path="payroll" element={<Payroll />} />
            <Route path="fee" element={<Fees />} />
            <Route path="user-management" element={<UserManagement />} />

            <Route path="settings" element={<SettingsPage />}>
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
  )
}

