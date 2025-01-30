import { useAppSelector } from "@/redux/hooks/useAppSelector"
import { selectIsAuthenticated } from "@/redux/slices/authSlice"
import type React from "react"
import { Navigate, Outlet } from "react-router-dom"


const PrivateRoute: React.FC = () => {
  const isAuthenticated = useAppSelector(selectIsAuthenticated)

  return isAuthenticated ? <Outlet /> : <Navigate to="/auth/login" replace />
}

export default PrivateRoute

