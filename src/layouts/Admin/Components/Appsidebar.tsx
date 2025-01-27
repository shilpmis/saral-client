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
        url: "/d",
        icon: Home,
    },
    {
        title: "Student",
        url: "/d/students",
        icon: Users,
    },
    {
        title: "Staff",
        url: "/d/staff",
        icon: UserCheck,
    },
    {
        title: "Payroll",
        url: "/d/payroll",
        icon: Landmark,
    },
    {
        title: "Fees",
        url: "/d/fee",
        icon: IndianRupee,
    },
    {
        title: "Time Table",
        url: "/d/timetable",
        icon: Clock,
    },
    // {
    //     title: "List of Complaints",
    //     url: "/d/complaints",
    //     icon: MessageSquare,
    // },
    {
        title: "Result",
        url: "/d/results",
        icon: FileText,
    },
    // {
    //     title: "Transport Department",
    //     url: "/d/transport",
    //     icon: Truck,
    // },
    // {
    //     title: "Hostel Department",
    //     url: "/d/hostel",
    //     icon: Bed,
    // },
];

const SideBarFooter = [

    {
        title: "User Management",
        url: "/d/user-management",
        icon: Users,
    },
    {
        title: "Settings",
        url: "/d/settings",
        icon: Settings,
    },
    // {
    //     title: "Inbox",
    //     url: "/inbox",
    //     icon: Inbox,
    // },
    // {
    //     title: "Search",
    //     url: "/search",
    //     icon: Search,
    // },
];

export default function AppSidebar() {
    return (
        <Sidebar variant="sidebar" collapsible="icon">
            <SidebarHeader>
                <SidebarMenuButton asChild>
                    {/* <div className="p-5 bg-[#ed9254] text-white text-center"> */}
                        <SidebarMenuItem className="rounded-lg">
                            <SidebarMenuButton asChild>
                                <Link to='/' className="p-5 bg-[#ed9254] text-white text-center rounded-lg">
                                    <Home className="mr-2" />
                                    <span>Melzo School</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    {/* </div> */}
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
                    <SidebarGroupLabel>Manage</SidebarGroupLabel>
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
