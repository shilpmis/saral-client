import React, { useEffect } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  Home,
  Settings,
  FileText,
  Clock,
  Landmark,
  UserCheck,
  Users,
  IndianRupee,
  Bed,
  ClipboardList,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Permission, UserRole } from "@/types/user";
import { useAuth } from "@/redux/hooks/useAuth";
import { useAppSelector } from "@/redux/hooks/useAppSelector";
import { selectAuthState } from "@/redux/slices/authSlice";

const SideBarItems = [
  { title: "Dashboard", url: "/d", icon: Home },
  { title: "Student", url: "/d/students", icon: Users, requiredPermission: Permission.MANAGE_STUDENTS },
  { title: "Staff", url: "/d/staff", icon: UserCheck, requiredPermission: Permission.MANAGE_STAFF },
  { title: "My Leaves", url: "/d/leave-applications", icon: Bed, requiredPermission: Permission.MARK_LEAVES },
  { title: "Leave Management", url: "/d/leaves", icon: Bed, requiredPermission: Permission.MANAGE_LEAVES },
  { title: "Attendance Management", url: "/d/attendance", icon: ClipboardList, requiredPermission: Permission.MANAGE_ATTENDANCE },
  { title: "Attendance", url: "/d/mark-attendance", icon: ClipboardList, requiredPermission: Permission.MARK_ATTENDANCE },
  { title: "Fees", url: "/d/fee", icon: IndianRupee, requiredPermission: Permission.MANAGE_FEES },
  { title: "Admissions", url: "/d/admissions", icon: ClipboardList, requiredPermission: Permission.MANAGE_ADMISSION },
  // { title: "Time Table", url: "/d/timetable", icon: Clock , requiredPermission: Permission.MANAGE_SETTINGS},
  // { title: "Result", url: "/d/results", icon: FileText , requiredPermission: Permission.MANAGE_SETTINGS},
  // { title: "Payroll", url: "/d/payroll", icon: Landmark  , requiredPermission: Permission.MANAGE_PAYROLL},
];

const SideBarFooter = [
  { title: "User Management", url: "/d/users", icon: Users, requiredPermission: Permission.MANAGE_USERS },
  { title: "Settings", url: "/d/settings", icon: Settings, requiredPermission: Permission.MANAGE_SETTINGS },
];

interface AppSidebarProps {
  isCollapsed: boolean;
}

export default function AppSidebar({ isCollapsed }: AppSidebarProps) {

  const { hasPermission, hasRole } = useAuth();

  return (
    <Sidebar variant="sidebar" collapsible="icon">
      <SidebarHeader className="p-2 bg-white rounded-lg">
        <div className="flex items-center justify-center p-2 bg-white rounded-lg">
          {isCollapsed ? (
            <img
              src="/melzo_logo.png"
              alt="Product logo"
              width={70}
              height={70}
              className="rounded-full border-2 border-black p-1 shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-2xl hover:ring-2 hover:ring-orange-500"
            />
          ) : (
            <>
              <img
                src="/school-logo.png"
                alt="School Logo"
                width={70}
                height={60}
                className="rounded-full border-2 border-black p-1 shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-2xl hover:ring-2 hover:ring-orange-500"
              />
              <div className="h-16 w-[2px] bg-black mx-2"></div>
              <img
                src="/melzo_logo.png"
                alt="Product logo"
                width={70}
                height={60}
                className="rounded-full border-2 border-black p-1 shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-2xl hover:ring-2 hover:ring-orange-500"
              />
            </>
          )}
        </div>
      </SidebarHeader>
      <SidebarContent className="p-2 bg-white rounded-lg">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {SideBarItems.map((item) => {
                if (item.requiredPermission && !hasPermission(item.requiredPermission)) {
                  return null;
                }
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <Link to={item.url}>
                        <item.icon className="mr-2" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      {hasRole(UserRole.ADMIN) && (<SidebarFooter className="p-2 bg-white rounded-lg">
        <SidebarGroup>
          <SidebarGroupLabel>Manage</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {SideBarFooter.map((item) => {
                // Conditionally render the menu item if a requiredPermission is provided.
                if (item.requiredPermission && !hasPermission(item.requiredPermission)) {
                  return null;
                }
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <Link to={item.url}>
                        <item.icon className="mr-2" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarFooter>)}
    </Sidebar>
  );
}
