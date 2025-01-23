import { Button } from '@/components/ui/button'
import { Sidebar, SidebarProvider } from '@/components/ui/sidebar'
import React from 'react'
import AppSidebar from './Components/Appsidebar'
import Header from './Components/Header'
import { Outlet } from 'react-router-dom';

export default function AdminLayout() {
    return (
        <SidebarProvider defaultOpen={true}>
            <AppSidebar />
            <main className='w-full'>
                <Header />
                <div className='p-3 w-full h-auto mt-6'>
                    <Outlet />
                </div>
            </main>
        </SidebarProvider>
    )
}
