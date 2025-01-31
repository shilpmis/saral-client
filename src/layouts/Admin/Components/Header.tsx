import { Button } from "@/components/ui/button"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { useAppDispatch } from "@/redux/hooks/useAppDispatch"
import { logout } from "@/services/AuthService"

export default function Header() {
  const dispatch = useAppDispatch()

  const handleLogout = () => {
    dispatch(logout())
  }
  return (
    <div className="w-full h-auto shadow-lg rounded-md flex justify-between items-center p-2">
        <SidebarTrigger/>
        <Button onClick={handleLogout} variant="outline">
          Logout
        </Button>
    </div>
  )
}