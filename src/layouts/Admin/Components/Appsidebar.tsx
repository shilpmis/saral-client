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
} from "@/components/ui/sidebar"
import {
  Settings,
  UserCheck,
  Users,
  IndianRupee,
  Bed,
  ClipboardList,
  ChevronDown,
  ChevronRight,
  DollarSign,
  BarChart3,
  Calendar,
  FileText,
  CreditCard,
  Briefcase,
} from "lucide-react"
import { Link, useLocation } from "react-router-dom"
import { Permission, UserRole } from "@/types/user"
import { useAuth } from "@/redux/hooks/useAuth"
import { useTranslation } from "@/redux/hooks/useTranslation"
import { cn } from "@/lib/utils"
import { useState } from "react"
import { useAppSelector } from "@/redux/hooks/useAppSelector"
import { selectAuthState, selectCurrentSchool } from "@/redux/slices/authSlice"

const SideBarItems = [
  { title: "student", url: "/d/students", icon: Users, requiredPermission: Permission.MANAGE_STUDENTS },
  { title: "staff", url: "/d/staff", icon: UserCheck, requiredPermission: Permission.MANAGE_STAFF },
  { title: "subjects", url: "/d/subjects", icon: UserCheck, requiredPermission: Permission.MANAGE_STAFF },
  { title: "my_leaves", url: "/d/leave-applications", icon: Bed, requiredPermission: Permission.MARK_LEAVES },
  { title: "leave_management", url: "/d/leaves", icon: Bed, requiredPermission: Permission.MANAGE_LEAVES },
  {
    title: "attendance_management",
    url: "/d/attendance",
    icon: ClipboardList,
    requiredPermission: Permission.MANAGE_ATTENDANCE,
  },
  {
    title: "attendance",
    url: "/d/mark-attendance",
    icon: ClipboardList,
    requiredPermission: Permission.MARK_ATTENDANCE,
  },
  { title: "payments", url: "/d/pay-fees", icon: IndianRupee, requiredPermission: Permission.PAY_FEES },
  { title: "manage_fees", url: "/d/fee", icon: IndianRupee, requiredPermission: Permission.MANAGE_FEES },
  { title: "admissions", url: "/d/admissions", icon: ClipboardList, requiredPermission: Permission.MANAGE_ADMISSION },
]

// Payroll items with sub-items
const PayrollItems = {
  title: "payroll",
  icon: DollarSign,
  requiredPermission: Permission.MANAGE_PAYROLL,
  subItems: [
    // { title: "payroll_dashboard", url: "/d/payroll/dashboard", icon: BarChart3 },
    { title: "employees", url: "/d/payroll/employee", icon: Briefcase },
    { title: "pay_run", url: "/d/payroll/payrun", icon: Calendar },
    // { title: "salary_components", url: "/d/payroll/salary-components", icon: FileText },
    // { title: "salary_templates", url: "/d/payroll/salary-templates", icon: CreditCard },
  ],
}

const SideBarFooter = [
  { title: "user_management", url: "/d/users", icon: Users, requiredPermission: Permission.MANAGE_USERS },
  { title: "settings", url: "/d/settings", icon: Settings, requiredPermission: Permission.MANAGE_SETTINGS },
]

interface AppSidebarProps {
  isCollapsed: boolean
}

export default function AppSidebar({ isCollapsed }: AppSidebarProps) {
  const { hasPermission, hasRole } = useAuth()
  const { t } = useTranslation()
  const location = useLocation()
  const schoolState = useAppSelector(selectCurrentSchool)
  const [isPayrollExpanded, setIsPayrollExpanded] = useState(false)

  // Function to check if a menu item is active
  const isActive = (url: string) => {
    return location.pathname === url || location.pathname.startsWith(`${url}/`)
  }

  // Function to check if any payroll sub-item is active
  const isAnyPayrollItemActive = () => {
    return PayrollItems.subItems.some((item) => isActive(item.url))
  }

  // Toggle payroll accordion
  const togglePayrollAccordion = () => {
    setIsPayrollExpanded(!isPayrollExpanded)
  }

  // Auto-expand payroll accordion if any of its items is active
  useState(() => {
    if (isAnyPayrollItemActive()) {
      setIsPayrollExpanded(true)
    }
  })

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
                src="/melzo_logo.png"
                alt="Product logo"
                width={70}
                height={60}
                className="rounded-full border-2 border-black p-1 shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-2xl hover:ring-2 hover:ring-orange-500"
              />
              <div className="h-16 w-[2px] bg-black mx-2"></div>
              <img
                src={schoolState.school_logo || "/default_school_logo.png"}
                alt="School Logo"
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
                  return null
                }
                const active = isActive(item.url)
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={active}
                      className={cn(
                        active && "bg-orange-100 text-orange-700 font-medium",
                        active && "hover:bg-orange-200 hover:text-orange-800",
                      )}
                    >
                      <Link to={item.url}>
                        <item.icon className={cn("mr-2", active && "text-orange-700")} />
                        <span>{t(item.title)}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}

              {/* Payroll Accordion */}
              {(!PayrollItems.requiredPermission || hasPermission(PayrollItems.requiredPermission)) && (
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={togglePayrollAccordion}
                    className={cn(
                      isAnyPayrollItemActive() && "bg-orange-100 text-orange-700 font-medium",
                      isAnyPayrollItemActive() && "hover:bg-orange-200 hover:text-orange-800",
                    )}
                    isActive={isAnyPayrollItemActive()}
                  >
                    <PayrollItems.icon className={cn("mr-2", isAnyPayrollItemActive() && "text-orange-700")} />
                    <span>{t(PayrollItems.title)}</span>
                    {isPayrollExpanded ? (
                      <ChevronDown className={cn("ml-auto h-4 w-4", isAnyPayrollItemActive() && "text-orange-700")} />
                    ) : (
                      <ChevronRight className={cn("ml-auto h-4 w-4", isAnyPayrollItemActive() && "text-orange-700")} />
                    )}
                  </SidebarMenuButton>

                  {/* Payroll Sub-items */}
                  {isPayrollExpanded && (
                    <div className="pl-6 mt-1 space-y-1">
                      {PayrollItems.subItems.map((subItem) => {
                        const subActive = isActive(subItem.url)
                        return (
                          <SidebarMenuItem key={subItem.title}>
                            <SidebarMenuButton
                              asChild
                              isActive={subActive}
                              className={cn(
                                subActive && "bg-orange-100 text-orange-700 font-medium",
                                subActive && "hover:bg-orange-200 hover:text-orange-800",
                              )}
                            >
                              <Link to={subItem.url}>
                                <subItem.icon className={cn("mr-2", subActive && "text-orange-700")} />
                                <span>{t(subItem.title)}</span>
                              </Link>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        )
                      })}
                    </div>
                  )}
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      {hasRole(UserRole.ADMIN) && (
        <SidebarFooter className="p-2 bg-white rounded-lg">
          <SidebarGroup>
            <SidebarGroupLabel>{t("manage")}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {SideBarFooter.map((item) => {
                  if (item.requiredPermission && !hasPermission(item.requiredPermission)) {
                    return null
                  }
                  const active = isActive(item.url)
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={active}
                        className={cn(
                          active && "bg-orange-100 text-orange-700 font-medium",
                          active && "hover:bg-orange-200 hover:text-orange-800",
                        )}
                      >
                        <Link to={item.url}>
                          <item.icon className={cn("mr-2", active && "text-orange-700")} />
                          <span>{t(item.title)}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarFooter>
      )}
    </Sidebar>
  )
}
