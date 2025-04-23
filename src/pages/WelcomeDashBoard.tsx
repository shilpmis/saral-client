"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  BookOpen,
  Calendar,
  CheckCircle,
  Clock,
  FileText,
  GraduationCap,
  MessageSquare,
  Settings,
  Users,
  Bell,
  Briefcase,
  ClipboardList,
  CreditCard,
  FileSpreadsheet,
  School,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useAppSelector } from "@/redux/hooks/useAppSelector"
import { selectAuthState } from "@/redux/slices/authSlice"
import { useTranslation } from "@/redux/hooks/useTranslation"

type UserRole = "admin" | "clerk" | "teacher" | string

interface QuickAction {
  title: string
  description: string
  icon: React.ReactNode
  href: string
  color: string
}

interface Notification {
  id: string
  title: string
  message: string
  time: string
  read: boolean
}

export function WelcomeDashboard() {
  const { t } = useTranslation()
  const auth = useAppSelector(selectAuthState)
  const [userRole, setUserRole] = useState<UserRole>("admin")
  const [greeting, setGreeting] = useState("")
  const [notifications, setNotifications] = useState<Notification[]>([])

  // Determine user role from auth state
  useEffect(() => {
    if (auth.user?.role) {
      setUserRole(auth.user.role.toLowerCase())
    }
  }, [auth])

  // Set greeting based on time of day
  useEffect(() => {
    const hour = new Date().getHours()
    if (hour < 12) setGreeting(t("Good Morning"))
    else if (hour < 18) setGreeting(t("Good Afternoon"))
    else setGreeting(t("Good Evening "))

    // Mock notifications - in a real app, fetch these from an API
    setNotifications([
      {
        id: "1",
        title: t("new_announcement"),
        message: t("there_is_a_staff_meeting_scheduled_for_tomorrow"),
        time: "10m ago",
        read: false,
      },
      {
        id: "2",
        title: t("leave_request_approved"),
        message: t("your_leave_request_has_been_approved"),
        time: "2h ago",
        read: true,
      },
      {
        id: "3",
        title: t("system_update"),
        message: t("the_system_will_be_updated_tonight_at_2am"),
        time: "5h ago",
        read: true,
      },
    ])
  }, [])

  // Role-specific quick actions
  const getQuickActions = (): QuickAction[] => {
    switch (userRole) {
      case "admin":
        return [
          {
            title: t("manage_users"),
            description: t("add_edit_or_deactivate_user_accounts"),
            icon: <Users className="h-5 w-5" />,
            href: "/users",
            color: "bg-blue-500/10 text-blue-500",
          },
          {
            title: t("school_settings"),
            description: t("configure_school_details_and_policies"),
            icon: <School className="h-5 w-5" />,
            href: "/settings",
            color: "bg-purple-500/10 text-purple-500",
          },
          {
            title: t("academic_calendar"),
            description: t("manage_terms_holidays_and_events"),
            icon: <Calendar className="h-5 w-5" />,
            href: "/calendar",
            color: "bg-green-500/10 text-green-500",
          },
          {
            title: t("reports_overview"),
            description: t("access_school_wide_reports_and_analytics"),
            icon: <FileSpreadsheet className="h-5 w-5" />,
            href: "/reports",
            color: "bg-amber-500/10 text-amber-500",
          },
        ]
      case "clerk":
        return [
          {
            title: t("fee_collection"),
            description: t("record_and_manage_student_fee_payments"),
            icon: <CreditCard className="h-5 w-5" />,
            href: "/fees",
            color: "bg-emerald-500/10 text-emerald-500",
          },
          {
            title: t("student_records"),
            description: t("access_and_update_student_information"),
            icon: <GraduationCap className="h-5 w-5" />,
            href: "/students",
            color: "bg-blue-500/10 text-blue-500",
          },
          {
            title: t("attendance"),
            description: t("view_and_manage_attendance_records"),
            icon: <CheckCircle className="h-5 w-5" />,
            href: "/attendance",
            color: "bg-indigo-500/10 text-indigo-500",
          },
          {
            title: t("admissions"),
            description: t("process_new_student_applications"),
            icon: <ClipboardList className="h-5 w-5" />,
            href: "/admissions",
            color: "bg-rose-500/10 text-rose-500",
          },
        ]
      case "teacher":
        return [
          {
            title: t("my_classes"),
            description: t("view_your_class_schedule_and_students"),
            icon: <BookOpen className="h-5 w-5" />,
            href: "/classes",
            color: "bg-sky-500/10 text-sky-500",
          },
          {
            title: t("take_attendance"),
            description: t("mark_attendance_for_your_classes"),
            icon: <Clock className="h-5 w-5" />,
            href: "/attendance",
            color: "bg-amber-500/10 text-amber-500",
          },
          {
            title: t("assignments"),
            description: t("create_and_grade_student_assignments"),
            icon: <FileText className="h-5 w-5" />,
            href: "/assignments",
            color: "bg-emerald-500/10 text-emerald-500",
          },
          {
            title: t("leave_requests"),
            description: t("submit_and_track_your_leave_applications"),
            icon: <Briefcase className="h-5 w-5" />,
            href: "/leave",
            color: "bg-purple-500/10 text-purple-500",
          },
        ]
      default:
        return []
    }
  }

  // Get role-specific welcome message
  const getWelcomeMessage = (): string => {
    switch (userRole) {
      case "admin":
        return t("Welcome to your work desk")
      case "clerk":
        return t("Welcome to your work desk")
      case "teacher":
        return t("Welcome to your work desk")
      default:
        return t("Welcome to your dashboard")
    }
  }

  // Get role-specific stats
  const getRoleStats = () => {
    switch (userRole) {
      case "admin":
        return [
          // { label: t("total_students"), value: "1,234" },
          // { label: t("total_staff"), value: "98" },
          // { label: t("pending_approvals"), value: "12" },
        ]
      case "clerk":
        return [
          // { label: t("pending_fees"), value: "45" },
          // { label: t("today_collections"), value: "₹24,500" },
          // { label: t("new_admissions"), value: "8" },
        ]
      case "teacher":
        return [
          // { label: t("classes_today"), value: "5" },
          // { label: t("assignments_due"), value: "12" },
          // { label: t("attendance_rate"), value: "96%" },
        ]
      default:
        return []
    }
  }

  const markAsRead = (id: string) => {
    setNotifications((prev) => prev.map((notif) => (notif.id === id ? { ...notif, read: true } : notif)))
  }

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <div className="container mx-auto p-4 space-y-8">
      {/* Welcome Header */}
      <div className="relative overflow-hidden rounded-lg border bg-gradient-to-r from-primary/20 via-primary/10 to-background p-6 shadow-md">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-primary/20 blur-3xl" />

        <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {greeting}, {auth.user?.name || t("user")}
            </h1>
            <p className="mt-2 text-muted-foreground">{getWelcomeMessage()}</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-6">
              {/* {getRoleStats().map((stat, i) => (
                <div key={i} className="text-center">
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              ))} */}
            </div>

            <Avatar className="h-12 w-12 border-2 border-background">
              <AvatarImage src={''} />
              <AvatarFallback>{auth.user?.name?.charAt(0) || "U"}</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>

      {/* Stats for mobile */}
      <div className="grid-cols-3 gap-4 md:hidden hidden">
        {getRoleStats().map((stat, i) => (
          <Card key={i} className="text-center">
            <CardContent className="p-4">
              {/* <p className="text-xl font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p> */}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="hidden">
        <h2 className="text-xl font-semibold mb-4">{t("quick_actions")}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {getQuickActions().map((action, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="h-full hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${action.color}`}>
                    {action.icon}
                  </div>
                  <CardTitle className="text-lg mt-2">{action.title}</CardTitle>
                </CardHeader>
                <CardContent className="pb-2">
                  <CardDescription>{action.description}</CardDescription>
                </CardContent>
                <CardFooter>
                  <Button variant="ghost" className="w-full justify-start" asChild>
                    <a href={action.href}>
                      {t("go_to")} {action.title} →
                    </a>
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Recent Activity & Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 hidden">
        {/* Recent Activity */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle>{t("recent_activity")}</CardTitle>
            <CardDescription>{t("your_recent_actions_and_updates")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {userRole === "admin" && (
                <>
                  <ActivityItem
                    icon={<Users className="h-4 w-4" />}
                    title={t("new_teacher_added")}
                    description={t("you_added_a_new_teacher_to_the_system")}
                    timestamp="2 hours ago"
                  />
                  <ActivityItem
                    icon={<Settings className="h-4 w-4" />}
                    title={t("system_settings_updated")}
                    description={t("you_updated_the_academic_year_settings")}
                    timestamp="Yesterday"
                  />
                </>
              )}

              {userRole === "clerk" && (
                <>
                  <ActivityItem
                    icon={<CreditCard className="h-4 w-4" />}
                    title={t("fee_payment_recorded")}
                    description={t("you_recorded_a_fee_payment_for_student_john_doe")}
                    timestamp="1 hour ago"
                  />
                  <ActivityItem
                    icon={<GraduationCap className="h-4 w-4" />}
                    title={t("student_record_updated")}
                    description={t("you_updated_contact_information_for_3_students")}
                    timestamp="Yesterday"
                  />
                </>
              )}

              {userRole === "teacher" && (
                <>
                  <ActivityItem
                    icon={<CheckCircle className="h-4 w-4" />}
                    title={t("attendance_marked")}
                    description={t("you_marked_attendance_for_class_10a")}
                    timestamp="3 hours ago"
                  />
                  <ActivityItem
                    icon={<FileText className="h-4 w-4" />}
                    title={t("assignment_created")}
                    description={t("you_created_a_new_math_assignment_for_class_9b")}
                    timestamp="Yesterday"
                  />
                </>
              )}

              <ActivityItem
                icon={<MessageSquare className="h-4 w-4" />}
                title={t("message_sent")}
                description={t("you_sent_a_message_to_the_science_department")}
                timestamp="2 days ago"
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full">
              {t("view_all_activity")}
            </Button>
          </CardFooter>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle>{t("notifications")}</CardTitle>
              {unreadCount > 0 && (
                <Badge variant="secondary">
                  {unreadCount} {t("new")}
                </Badge>
              )}
            </div>
            <CardDescription>{t("your_recent_notifications_and_alerts")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {notifications.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>{t("no_notifications")}</p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-3 rounded-lg border ${!notification.read ? "bg-primary/5 border-primary/20" : ""}`}
                  >
                    <div className="flex justify-between items-start">
                      <h4 className="font-medium">{notification.title}</h4>
                      {!notification.read && (
                        <Badge variant="outline" className="text-xs bg-primary/10">
                          {t("new")}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-xs text-muted-foreground">{notification.time}</span>
                      {!notification.read && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs"
                          onClick={() => markAsRead(notification.id)}
                        >
                          {t("mark_as_read")}
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full">
              {t("view_all_notifications")}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

// Activity Item Component
function ActivityItem({
  icon,
  title,
  description,
  timestamp,
}: {
  icon: React.ReactNode
  title: string
  description: string
  timestamp: string
}) {
  return (
    <div className="flex items-start space-x-3">
      <div className="bg-primary/10 rounded-full p-2">{icon}</div>
      <div className="flex-1">
        <h4 className="text-sm font-medium">{title}</h4>
        <p className="text-sm text-muted-foreground">{description}</p>
        <p className="text-xs text-muted-foreground mt-1">{timestamp}</p>
      </div>
    </div>
  )
}

