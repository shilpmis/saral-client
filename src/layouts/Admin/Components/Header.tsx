import { use, useEffect, useState } from "react"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { useAppDispatch } from "@/redux/hooks/useAppDispatch"
import { logout } from "@/services/AuthService"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Search } from "@/components/Dashboard/Search"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuShortcut, // Added import for DropdownMenuShortcut
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";
import { useAppSelector } from "@/redux/hooks/useAppSelector"
import { toast } from "@/hooks/use-toast"

const shortFormForRole: any = {
   1 : "AD",
   2 : "PR",
   3 : "HT",
   4 : "CL",
   5 : "IT",
   6 : "TE",
} 

export default function Header() {
  const dispatch = useAppDispatch()
  const users = useAppSelector((state) => state.auth.user)
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false)
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  const handleLogout = async () => {
    setIsLogoutDialogOpen(false)
    await dispatch(logout())
  }
  useEffect(() => {
    const handleOnlineStatusChange = () => {
      setIsOnline(navigator.onLine);
    };

    window.addEventListener("online", handleOnlineStatusChange);
    window.addEventListener("offline", handleOnlineStatusChange);

    return () => {
      window.removeEventListener("online", handleOnlineStatusChange);
      window.removeEventListener("offline", handleOnlineStatusChange);
    };
  }, []);

  return (
    <>
    {!isOnline && (
        <div
          className="w-full h-auto shadow-lg rounded-md flex justify-center items-center p-2"
          style={{
            position: "fixed", 
            top: 0,
            height: "30px",
            backgroundColor: "#f8d7da",
            color: "#721c24",
            zIndex: 9
          }}
        >
          <span className="text-sm font-medium">No Internet Connection (·•᷄‎ࡇ•᷅ )</span>
        </div>
      )}
    <div className="w-full h-auto shadow-lg rounded-md flex justify-between items-center p-2">
      <SidebarTrigger />
      <div className="flex gap-4">
        <Search></Search>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage src="/avatars/01.png" alt="@johndoe" />
                <AvatarFallback>{users?.role_id ? shortFormForRole[users.role_id] : ""}</AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{users?.name}</p>
                <p className="text-xs leading-none text-muted-foreground">{users?.saral_email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                Profile
                <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
              </DropdownMenuItem>
              <DropdownMenuItem>
                Settings
                <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => setIsLogoutDialogOpen(true)}
              className="bg-red-600 text-white hover:bg-red-600 cursor-pointer rounded-md"
            >
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <Dialog open={isLogoutDialogOpen} onOpenChange={setIsLogoutDialogOpen}>
        <DialogContent className="max-w-md rounded-2xl shadow-lg">
          <DialogHeader className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 10 }}
              className="mx-auto mb-4 w-14 h-14 flex items-center justify-center bg-red-100 rounded-full"
            >
              <AlertTriangle className="text-red-600 w-7 h-7" />
            </motion.div>
            <DialogTitle className="text-2xl font-bold text-gray-800">Logout Confirmation</DialogTitle>
            <DialogDescription className="text-gray-600">
              Are you sure you want to logout? You will be redirected to the login page.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 flex justify-center space-x-4">
            <Button type="button" variant="outline" onClick={() => setIsLogoutDialogOpen(false)} className="px-6 py-2 rounded-lg">
              Cancel
            </Button>
            <Button type="button" variant="destructive" onClick={handleLogout} className="px-6 py-2 rounded-lg bg-red-600 text-white">
              Logout
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
    </>
  )
}

