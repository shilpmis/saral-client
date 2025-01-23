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
    Calendar,
    Home,
    Inbox,
    Search,
    Settings,
    EllipsisVertical,
    Bed,
    DollarSign,
    MessageSquare,
    FileText,
    Truck,
    Clock,
    Book,
    Landmark,
    UserCheck,
    Users,
    IndianRupee,
} from "lucide-react";
import { Link } from "react-router-dom";

const SideBarItems = [
    {
        title: "Dashboard",
        url: "/login",
        icon: Home,
    },
    {
        title: "User Management",
        url : "/admin/user-management",
        icon: Users,
    },
    {
        title: "Student",
        url: "/admin/students",
        icon: Users,
    },
    {
        title: "Staff",
        url: "/admin/staff",
        icon: UserCheck,
    },
    {
        title: "Payroll",
        url: "/admin/payroll",
        icon: Landmark,
    },
    {
        title: "Fee Structure",
        url: "/admin/fee",
        icon: IndianRupee,
    },
    {
        title: "Appointment Details",
        url: "/admin/appointment",
        icon: Calendar,
    },
    {
        title: "List of Guardians",
        url: "/admin/guardians",
        icon: EllipsisVertical,
    },
    {
        title: "School Academic Management",
        url: "/admin/academics",
        icon: Book,
    },
    {
        title: "School Time Table",
        url: "/admin/timetable",
        icon: Clock,
    },
    {
        title: "List of Complaints",
        url: "/admin/complaints",
        icon: MessageSquare,
    },
    {
        title: "Result Details",
        url: "/admin/results",
        icon: FileText,
    },
    {
        title: "Transport Department",
        url: "/admin/transport",
        icon: Truck,
    },
    {
        title: "Hostel Department",
        url: "/admin/hostel",
        icon: Bed,
    },
];

const SideBarFooter = [
    {
        title: "Settings",
        url: "/settings",
        icon: Settings,
    },
    {
        title: "Inbox",
        url: "/inbox",
        icon: Inbox,
    },
    {
        title: "Search",
        url: "/search",
        icon: Search,
    },
];

export default function AppSidebar() {
    return (
        <Sidebar variant="sidebar" collapsible="icon">
            <SidebarHeader>
                <SidebarMenuButton asChild>
                    <div>
                        <span>School Logo</span>
                    </div>
                </SidebarMenuButton>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Application</SidebarGroupLabel>
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
            <SidebarFooter>
                <SidebarGroup>
                    <SidebarGroupLabel>Footer</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {SideBarFooter.map((item) => (
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
            </SidebarFooter>
        </Sidebar>
    );
}
