import { useState } from "react"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { useAppDispatch } from "@/redux/hooks/useAppDispatch"
import { logout } from "@/services/AuthService"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
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


export default function Header() {
  const dispatch = useAppDispatch()
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false)

  const handleLogout = async () => {
    setIsLogoutDialogOpen(false)
    await dispatch(logout())
  }

  return (
    <div className="w-full h-auto shadow-lg rounded-md flex justify-between items-center p-2">
      <SidebarTrigger />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-8 w-8">
              <AvatarImage src="/avatars/01.png" alt="@johndoe" />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">John Doe</p>
              <p className="text-xs leading-none text-muted-foreground">john.doe@example.com</p>
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
  )
}

