import React, { useEffect, useRef, useState } from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useAppDispatch } from "@/redux/hooks/useAppDispatch";
import { logout } from "@/services/AuthService";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Search } from "@/components/Dashboard/Search";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuShortcut, // Added import for DropdownMenuShortcut
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertCircle,
  AlertTriangle,
  LogOut,
  Settings,
  Upload,
  User,
} from "lucide-react";
import { motion } from "framer-motion";

import { useAppSelector } from "@/redux/hooks/useAppSelector";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";


const shortFormForRole: any = {
  1: "AD",
  2: "PR",
  3: "HT",
  4: "CL",
  5: "IT",
  6: "TE",
};

export default function Header() {

  const dispatch = useAppDispatch();
  const users = useAppSelector((state) => state.auth.user);

  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);

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
            <Avatar className="h-11 w-11 cursor-pointer border-2 border-primary hover:border-primary/80 transition-colors">
              <AvatarImage
                src="https://img.freepik.com/free-vector/businessman-character-avatar-isolated_24877-60111.jpg?t=st=1741157072~exp=1741160672~hmac=ed96e089fd628b2ab1f81ea8e2bb6ecdda05224e16db03ed8a1745e8b9787c4f&w=900"
                alt="User"
              />
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="max-w-[90rem]" align="end">
          <DropdownMenuItem>
               <div className="flex flex-col"> {/* Container for the inputs */}
               <p className="border-none">
                      {users?.name?.toUpperCase()}
               </p>
               <p className="border-none focus:ring-0">
                      {users?.saral_email}
              </p>
              </div>
          </DropdownMenuItem>
            <Dialog>
              <DialogTrigger
                asChild
                className="hover:bg-gray-100 px-2 w-60 py-1"
              >
                <button className="flex items-center space-x-2 gap-3 my-2">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[350px] md:max-w-[500px] lg:max-w-[600px] xl:max-w-[600px] mx-5">
                <DialogHeader>
                  <DialogTitle>View Profile</DialogTitle>
                  <DialogDescription>
                    You Can See Your Profile Here.
                  </DialogDescription>
                </DialogHeader>
                <div className="flex justify-center my-4">
                  <Avatar className="h-24 w-24">
                    <AvatarImage
                      src="https://img.freepik.com/free-vector/businessman-character-avatar-isolated_24877-60111.jpg?t=st=1741157072~exp=1741160672~hmac=ed96e089fd628b2ab1f81ea8e2bb6ecdda05224e16db03ed8a1745e8b9787c4f&w=900"
                      alt="User"
                    />
                  </Avatar>
                </div>
                <div className="grid gap-6 py-4">
                  <div className="space-y-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="name" className="text-right">
                        Name
                      </Label>
                      <Input
                        id="name"
                        defaultValue={users?.name}
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="schoolName" className="text-right">
                        School Name
                      </Label>
                      <Input
                        id="schoolName"
                        defaultValue={users?.school.name}
                        type="text"
                        className="col-span-3"
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="status" className="text-right">
                        Status
                      </Label>
                      <Input
                        id="status"
                        defaultValue={users?.school.status}
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="contactNumber" className="text-right">
                        Contact Number
                      </Label>
                      <Input
                        id="contactNumber"
                        defaultValue={users?.school.contact_number}
                        className="col-span-3"
                      />
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog>
              <DialogTrigger
                asChild
                className="hover:bg-gray-100 px-2 w-60 py-1"
              >
                <button className="flex items-center space-x-2 gap-3 mb-2">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Setting</span>
                </button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Settings</DialogTitle>
                  <DialogDescription>
                    Adjust your account settings here.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="theme" className="text-right">
                      Theme
                    </Label>
                    <div className="col-span-3 flex items-center space-x-2">
                      <Button variant="outline" size="sm">
                        Light
                      </Button>
                      <Button variant="outline" size="sm">
                        Dark
                      </Button>
                      <Button variant="outline" size="sm">
                        System
                      </Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="notifications" className="text-right">
                      Notifications
                    </Label>
                    <div className="col-span-3">
                      <Input
                        id="notifications"
                        type="checkbox"
                        className="w-4 h-4"
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">Save settings</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog
              open={isLogoutDialogOpen}
              onOpenChange={setIsLogoutDialogOpen}
            >
              <DialogTrigger
                asChild
                className="bg-red-600 hover:bg-gray-100 rounded border px-2 w-60 py-1"
              >
                <button className="flex items-center space-x-2 gap-3 mt-2 ">
                  <LogOut />
                  <span>Logout</span>
                </button>
              </DialogTrigger>
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
                  <DialogTitle className="text-2xl font-bold text-gray-800">
                    Logout Confirmation
                  </DialogTitle>
                  <DialogDescription className="text-gray-600">
                    Are you sure you want to logout? You will be redirected to
                    the login page.
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

