import type React from "react"
import { cn } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  User,
  Settings,
  CreditCard,
  Mail,
  Lock,
  Users,
  Building2,
  GraduationCap,
  DollarSign,
  Bell,
  BookOpen,
} from "lucide-react"

interface NavItem {
  title: string
  icon: React.ElementType
  href: string
}

interface NavSection {
  title: string
  items: NavItem[]
}

const navigationSections: NavSection[] = [
  {
    title: "User Settings",
    items: [
      {
        title: "General Management",
        icon: Settings,
        href: "/settings/general",
      },
      {
        title: "Notifications",
        icon: Bell,
        href: "/settings/notifications",
      },
    ],
  },
  {
    title: "School Settings",
    items: [
      {
        title: "Academic Management",
        icon: GraduationCap,
        href: "/settings/academic",
      },
      {
        title: "Staff Management",
        icon: Users,
        href: "/settings/staff",
      },
      {
        title: "Payroll Management",
        icon: DollarSign,
        href: "/settings/payroll",
      },
      {
        title: "Fees Management",
        icon: CreditCard,
        href: "/settings/fees",
      },
    ],
  },
]

interface SettingsSidebarProps {
  currentPath: string
}

export function SettingsSidebar({ currentPath }: SettingsSidebarProps) {
  return (
    <div className="w-64 min-h-screen border-r bg-gray-50/40">
      <ScrollArea className="h-full py-6">
        <div className="px-4 pb-4">
          <h2 className="px-2 text-lg font-semibold tracking-tight">Settings</h2>
        </div>
        <div className="space-y-6">
          {navigationSections.map((section, i) => (
            <div key={section.title} className="px-3">
              <div className="space-y-1">
                <h3 className="px-2 text-xs font-medium text-gray-500 uppercase tracking-wider">{section.title}</h3>
                <div className="space-y-1">
                  {section.items.map((item) => (
                    <a
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-x-3 text-sm font-medium px-3 py-2 rounded-md hover:bg-gray-100 transition-colors",
                        currentPath === item.href ? "bg-gray-100 text-gray-900" : "text-gray-600",
                      )}
                    >
                      <item.icon className="h-4 w-4" />
                      {item.title}
                    </a>
                  ))}
                </div>
              </div>
              {i < navigationSections.length - 1 && <Separator className="my-4 opacity-50" />}
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}

