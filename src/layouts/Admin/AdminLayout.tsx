import { Sidebar, SidebarProvider } from '@/components/ui/sidebar'
import React, { useEffect } from 'react'
import AppSidebar from './Components/Appsidebar'
import Header from './Components/Header'
import { Outlet, useNavigate } from 'react-router-dom';
import { useAppSelector } from '@/redux/hooks/useAppSelector'
import { selectVerificationStatus } from '@/redux/slices/authSlice'

export default function AdminLayout() {

    const verificationStatus = useAppSelector(selectVerificationStatus);
    const navigate = useNavigate();

    useEffect(() => {
        /**
         * Redirect to dashboard if user is authenticated but verification fails
         */
        if (!verificationStatus.isAuthenticated && !verificationStatus.isVerificationInProgress) {
            navigate('/')
        }
    }, [])

    return (
        <>
            {verificationStatus.isVerificationInProgress && <div>
                Loadding for dashboard ....
            </div>}
            {verificationStatus.isAuthenticated && <SidebarProvider defaultOpen={true}>
                <AppSidebar />
                <main className='w-full'>
                    <Header />
                    <div className='p-3 w-full h-auto mt-6'>
                        <Outlet />
                    </div>
                </main>
            </SidebarProvider>}
        </>
    )
}
