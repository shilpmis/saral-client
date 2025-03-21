"use client"

import { DialogTrigger } from "@/components/ui/dialog"

import { useEffect, useState } from "react"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { useAppDispatch } from "@/redux/hooks/useAppDispatch"
import { logout } from "@/services/AuthService"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Search } from "@/components/Dashboard/Search"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { AlertTriangle, Bell, LogOut, Moon, Settings, Sun, User, Zap } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

import { useAppSelector } from "@/redux/hooks/useAppSelector"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

const shortFormForRole: any = {
  1: "AD",
  2: "PR",
  3: "HT",
  4: "CL",
  5: "IT",
  6: "TE",
}

export default function Header() {
  const dispatch = useAppDispatch()
  const users = useAppSelector((state) => state.auth.user)

  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false)
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [notifications, setNotifications] = useState([
    { id: 1, title: "New student enrolled", read: false, time: "10 min ago" },
    { id: 2, title: "Fee payment reminder", read: false, time: "1 hour ago" },
    { id: 3, title: "Staff meeting scheduled", read: true, time: "Yesterday" },
  ])

  const handleLogout = async () => {
    setIsLogoutDialogOpen(false)
    await dispatch(logout())
  }

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode)
    document.documentElement.classList.toggle("dark")
  }

  const markAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })))
  }

  useEffect(() => {
    const handleOnlineStatusChange = () => {
      setIsOnline(navigator.onLine)
    }

    window.addEventListener("online", handleOnlineStatusChange)
    window.addEventListener("offline", handleOnlineStatusChange)

    return () => {
      window.removeEventListener("online", handleOnlineStatusChange)
      window.removeEventListener("offline", handleOnlineStatusChange)
    }
  }, [])

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <>
      <AnimatePresence>
        {!isOnline && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full shadow-lg flex justify-center items-center p-2 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 z-50 fixed top-0"
          >
            <Zap className="h-4 w-4 mr-2 animate-pulse" />
            <span className="text-sm font-medium">No Internet Connection (·•᷄‎ࡇ•᷅ )</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div
        className={`w-full h-auto shadow-lg rounded-md flex justify-between items-center p-3 bg-white dark:bg-gray-900 transition-all duration-300 ${!isOnline ? "mt-10" : ""}`}
      >
        <div className="flex items-center gap-4">
          <SidebarTrigger />
          <div className="hidden md:flex">
            <h1 className="text-xl underline">
              {users?.school.name}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Search />

          {/* Theme Toggle */}
          {/* <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleDarkMode}
                  className="rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  {isDarkMode ? (
                    <Sun className="h-5 w-5 text-yellow-500" />
                  ) : (
                    <Moon className="h-5 w-5 text-gray-700" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Toggle {isDarkMode ? "Light" : "Dark"} Mode</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider> */}


          {/* User Profile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex items-center gap-2 cursor-pointer group">
                <Avatar className="h-10 w-10 border-2 border-primary group-hover:border-primary/80 transition-colors">
                  <AvatarImage
                    src="https://img.freepik.com/free-vector/businessman-character-avatar-isolated_24877-60111.jpg?t=st=1741157072~exp=1741160672~hmac=ed96e089fd628b2ab1f81ea8e2bb6ecdda05224e16db03ed8a1745e8b9787c4f&w=900"
                    alt="User"
                  />
                  <AvatarFallback className="bg-primary text-white">
                    {users?.name
                      ?.split(" ")
                      .map((n) => n[0])
                      .join("") || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:block">
                  <p className="text-sm font-medium line-clamp-1">{users?.name}</p>
                  <p className="text-xs text-gray-500 line-clamp-1">{users?.saral_email}</p>
                </div>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64" align="end">
              <div className="p-4 flex flex-col items-center gap-2 border-b">
                <Avatar className="h-16 w-16">
                  <AvatarImage
                    src="https://img.freepik.com/free-vector/businessman-character-avatar-isolated_24877-60111.jpg?t=st=1741157072~exp=1741160672~hmac=ed96e089fd628b2ab1f81ea8e2bb6ecdda05224e16db03ed8a1745e8b9787c4f&w=900"
                    alt="User"
                  />
                  <AvatarFallback className="bg-primary text-white text-xl">
                    {users?.name
                      ?.split(" ")
                      .map((n) => n[0])
                      .join("") || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="text-center">
                  <p className="font-semibold">{users?.name}</p>
                  <p className="text-xs text-gray-500">{users?.saral_email}</p>
                </div>
                <Badge variant="outline" className="mt-1">
                  {shortFormForRole[users!.role_id] || "User"}
                </Badge>
              </div>

              <div className="p-2">
                <DropdownMenuItem className="cursor-pointer flex items-center gap-2 p-2 rounded-md" asChild>
                  <Dialog>
                    <DialogTrigger className="w-full flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span>My Profile</span>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[350px] md:max-w-[500px] lg:max-w-[600px] xl:max-w-[600px] mx-5">
                      <DialogHeader>
                        <DialogTitle>Your Profile</DialogTitle>
                        <DialogDescription>View and manage your profile information</DialogDescription>
                      </DialogHeader>
                      <div className="flex justify-center my-4">
                        <Avatar className="h-24 w-24">
                          <AvatarImage
                            src="https://img.freepik.com/free-vector/businessman-character-avatar-isolated_24877-60111.jpg?t=st=1741157072~exp=1741160672~hmac=ed96e089fd628b2ab1f81ea8e2bb6ecdda05224e16db03ed8a1745e8b9787c4f&w=900"
                            alt="User"
                          />
                          <AvatarFallback className="bg-primary text-white text-2xl">
                            {users?.name
                              ?.split(" ")
                              .map((n) => n[0])
                              .join("") || "U"}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                      <div className="grid gap-6 py-4">
                        <div className="space-y-4">
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">
                              Name
                            </Label>
                            <Input id="name" defaultValue={users?.name} className="col-span-3" readOnly />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="schoolName" className="text-right">
                              School Name
                            </Label>
                            <Input
                              id="schoolName"
                              defaultValue={users?.school?.name}
                              type="text"
                              className="col-span-3"
                              readOnly
                            />
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="status" className="text-right">
                              Status
                            </Label>
                            <Input id="status" defaultValue={users?.school?.status} className="col-span-3" readOnly />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="contactNumber" className="text-right">
                              Contact Number
                            </Label>
                            <Input
                              id="contactNumber"
                              defaultValue={users?.school?.contact_number}
                              className="col-span-3"
                              readOnly
                            />
                          </div>
                        </div>
                      </div>
                      {/* <DialogFooter>
                        <Button>Edit Profile</Button>
                      </DialogFooter> */}
                    </DialogContent>
                  </Dialog>
                </DropdownMenuItem>

                <DropdownMenuItem className="cursor-pointer flex items-center gap-2 p-2 rounded-md" asChild>
                  <Dialog>
                    <DialogTrigger className="w-full flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      <span>Settings</span>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Settings</DialogTitle>
                        <DialogDescription>Adjust your account settings here.</DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {isDarkMode ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                            <Label htmlFor="theme">Dark Mode</Label>
                          </div>
                          <Switch id="theme" checked={isDarkMode} onCheckedChange={toggleDarkMode} />
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Bell className="h-4 w-4" />
                            <Label htmlFor="notifications">Notifications</Label>
                          </div>
                          <Switch id="notifications" defaultChecked />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button type="submit">Save settings</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  className="cursor-pointer flex items-center gap-2 p-2 rounded-md text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                  onClick={() => setIsLogoutDialogOpen(true)}
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
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
            <DialogTitle className="text-2xl font-bold text-gray-800 dark:text-gray-100">
              Logout Confirmation
            </DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400">
              Are you sure you want to logout? You will be redirected to the login page.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 flex justify-center space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsLogoutDialogOpen(false)}
              className="px-6 py-2 rounded-lg"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleLogout}
              className="px-6 py-2 rounded-lg bg-red-600 text-white"
            >
              Logout
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

