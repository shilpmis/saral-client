import { Outlet } from 'react-router-dom'

export default function AuthLayout() {
    return (
        <div className='p-2'>
              <Outlet />
        </div>
    )
}
