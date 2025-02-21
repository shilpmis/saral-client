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
import { Permission } from "@/types/user";
import { useAuth } from "@/redux/hooks/useAuth";

const SideBarItems = [
  { title: "Dashboard", url: "/d", icon: Home },
  { title: "Student", url: "/d/students", icon: Users },
  { title: "Staff", url: "/d/staff", icon: UserCheck },
  { title: "Mark Attendance", url: "/d/mark-attendance", icon: ClipboardList },
  { title: "Leave", url: "/d/leave", icon: Bed },
  { title: "Payroll", url: "/d/payroll", icon: Landmark },
  { title: "Fees", url: "/d/fee", icon: IndianRupee },
  { title: "Time Table", url: "/d/timetable", icon: Clock },
  { title: "Result", url: "/d/results", icon: FileText },
  { title: "Attendance Management", url: "/d/admin-attendance-mangement", icon: ClipboardList },
  { title: "Leave Management", url: "/d/admin-leave-management", icon: Bed },
];

const SideBarFooter = [
  { title: "User Management", url: "/d/user-management", icon: Users, requiredPermission: Permission.MANAGE_USERS },
  { title: "Settings", url: "/d/settings", icon: Settings },
];

interface AppSidebarProps {
  isCollapsed: boolean;
}

export default function AppSidebar({ isCollapsed }: AppSidebarProps) {
  const { hasPermission } = useAuth();

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
              {SideBarItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link to={item.url}>
                      <item.icon className="mr-2" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-2 bg-white rounded-lg">
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
      </SidebarFooter>
    </Sidebar>
  );
}
