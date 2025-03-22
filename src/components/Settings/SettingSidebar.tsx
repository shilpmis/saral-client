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
  Aperture,
  Clock,
} from "lucide-react"
import { Link } from "react-router-dom"
import { useTranslation } from "@/redux/hooks/useTranslation"

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
    title: "user_seetings",
    items: [
      {
        title: "general_seetings",
        icon: Settings,
        href: "/d/settings/general",
      },
      {
        title: "notifications",
        icon: Bell,
        href: "notifications",
      },
    ],
  },
  {
    title: "school_settings",
    items: [
      {
        title: "academic_management",
        icon: GraduationCap,
        href: "academic",
      },
      {
        title: "staff_management",
        icon: Users,
        href: "staff",
      },
      {
        title: "leave_management",
        icon: Aperture,
        href: "leave",
      },
      {
        title: "payroll_management",
        icon: DollarSign,
        href: "payroll",
      },
      {
        title: "fees_management",
        icon: CreditCard,
        href: "fees",
      },
      {
        title: "time_table_management",
        icon: Clock,
        href: "timeTable",
      },
      {
        title: "admission_management",
        icon: Building2,
        href: "admission",
      }
    ],
  },
]
interface SettingsSidebarProps {
  currentPath: string
}

export function SettingsSidebar({ currentPath }: SettingsSidebarProps) {
  const{t} = useTranslation()
  return (
    <div className="w-64 min-h-screen border-r bg-gray-50/40">
      <ScrollArea className="h-full py-6">
        <div className="px-4 pb-4">
          <h2 className="px-2 text-lg font-semibold tracking-tight">{t("settings")}</h2>
        </div>
        <div className="space-y-6">
          {navigationSections.map((section, i) => (
            <div key={section.title} className="px-3">
              <div className="space-y-1">
                <h3 className="px-2 text-xs font-medium text-gray-500 uppercase tracking-wider">{t(section.title)}</h3>
                <div className="space-y-1">
                  {section.items.map((item) => (
                    <Link
                      key={item.href}
                      to={item.href}
                      className={cn(
                        "flex items-center gap-x-3 text-sm font-medium px-3 py-2 rounded-md hover:bg-gray-100 transition-colors",
                        currentPath === item.href ? "bg-gray-100 text-gray-900" : "text-gray-600",
                      )}
                    >
                      <item.icon className="h-4 w-4" />
                      {t(item.title)}
                    </Link>
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


