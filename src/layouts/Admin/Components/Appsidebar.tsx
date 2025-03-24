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
import { useTranslation } from "@/redux/hooks/useTranslation";

const SideBarItems = [
  { title: "student", url: "/d/students", icon: Users, requiredPermission: Permission.MANAGE_STUDENTS },
  { title: "staff", url: "/d/staff", icon: UserCheck, requiredPermission: Permission.MANAGE_STAFF },
  { title: "my_leaves", url: "/d/leave-applications", icon: Bed, requiredPermission: Permission.MARK_LEAVES },
  { title: "leave_management", url: "/d/leaves", icon: Bed, requiredPermission: Permission.MANAGE_LEAVES },
  { title: "attendance_management", url: "/d/attendance", icon: ClipboardList, requiredPermission: Permission.MANAGE_ATTENDANCE },
  { title: "attendance", url: "/d/mark-attendance", icon: ClipboardList, requiredPermission: Permission.MARK_ATTENDANCE },
  { title: "payments", url: "/d/pay-fees", icon: IndianRupee, requiredPermission: Permission.PAY_FEES },
  { title: "manage_fees", url: "/d/fee", icon: IndianRupee, requiredPermission: Permission.MANAGE_FEES },
  { title: "admissions", url: "/d/admissions", icon: ClipboardList, requiredPermission: Permission.MANAGE_ADMISSION },
];

const SideBarFooter = [
  { title: "user_management", url: "/d/users", icon: Users, requiredPermission: Permission.MANAGE_USERS },
  { title: "settings", url: "/d/settings", icon: Settings, requiredPermission: Permission.MANAGE_SETTINGS },
];

interface AppSidebarProps {
  isCollapsed: boolean;
}

export default function AppSidebar({ isCollapsed }: AppSidebarProps) {

  const { hasPermission, hasRole } = useAuth();
  const {t} = useTranslation();

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
                        <span>{t(item.title)}</span>
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
          <SidebarGroupLabel>{t("manage")}</SidebarGroupLabel>
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
                        <span>{t(item.title)}</span>
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
