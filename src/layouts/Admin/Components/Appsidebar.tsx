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
import { Calendar, Home, Inbox, Search, Settings , EllipsisVertical} from "lucide-react"
import { NavLink } from "react-router-dom"
import { Link } from 'react-router-dom';


const SideBarItems = [
    {
        title: "Dashboard",
        url: "/login",
        icon: Home,
    },
    {
        title: "Students",
        url: "#",
        icon: Inbox,
    },
    {
        title: "Teachers",
        url: "#",
        icon: Calendar,
    },
]

const SideBarFooter = [
    {
        title: "Settings",
        url: "/settings",
        icon: Settings,
    },
]


export default function AppSidebar() {
    return (
        <Sidebar variant="sidebar" collapsible="icon">
            <SidebarHeader >
                {/* <SidebarMenuItem  > */}
                <SidebarMenuButton asChild>
                    <div>
                        <span>{'School Logo'}</span>
                    </div>
                </SidebarMenuButton>
                {/* </SidebarMenuItem> */}
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
                                            <item.icon />
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
                {SideBarFooter.map((item) => (
                    <SidebarMenuButton asChild>
                        <Link to={item.url}>
                            <item.icon />
                            <span>{item.title}</span>
                            <EllipsisVertical />
                        </Link>
                    </SidebarMenuButton>
                ))}
            </SidebarFooter>
        </Sidebar>
    )
}
