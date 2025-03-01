/**
 * 
 * TODO : fix issue while opens up dialog box for update user , (screen became uninteractable)
 */

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileDown, Upload, Plus } from "lucide-react"
import type { User } from "@/types/user"
import ManagementUserTable from "@/components/Users/ManagementUserTable"
import TeacherAsUserTable from "@/components/Users/TeacherAsUserTable"
import { useAppDispatch } from "@/redux/hooks/useAppDispatch"
import { useAppSelector } from "@/redux/hooks/useAppSelector"
import { toast } from "@/hooks/use-toast"
import { useLazyFetchManagementUsersQuery, useLazyFetchUserAsTeacherQuery } from "@/services/UserManagementService"
import { DialogDescription } from "@radix-ui/react-dialog"
import { PageMeta } from "@/types/global"
import { UserForm } from "@/components/Users/UserForm"
import StaffTable from "@/components/Staff/StaffTable"

// Predefined management roles
const managementRoles = [
  { id: 1, role: "ADMIN", permissions: {} },
  { id: 2, role: "PRINCIPAL", permissions: {} },
  { id: 3, role: "HEAD_TEACHER", permissions: {} },
  { id: 4, role: "CLERCK", permissions: {} },
  { id: 5, role: "IT_ADMIN", permissions: {} },
]

// Dummy data for staff
const dummyStaff = [
  { id: 1, name: "John Doe", email: "john@example.com", role: "Teacher", status: "Active", class: "5A" },
  { id: 2, name: "Jane Smith", email: "jane@example.com", role: "Administrator", status: "Active", class: null },
  { id: 3, name: "Bob Johnson", email: "bob@example.com", role: "Teacher", status: "Inactive", class: "3B" },
]

export const UserManagement: React.FC = () => {

  const dispatch = useAppDispatch()
  const users = useAppSelector((state) => state.auth.user)

  const [fetchUsers, { isLoading, isError }] = useLazyFetchManagementUsersQuery();

  const [fetchTeacherAsUser, { isLoading: loadingForFetchTeacherAsUser }] = useLazyFetchUserAsTeacherQuery()

  const [activeTab, setActiveTab] = useState("management")
  const [isDialogForManagmentUserOpen, setIsDialogForManagmentUserOpen]
    = useState<{ isOpen: boolean, type: "create" | "edit", user: User | null }>({
      isOpen: false,
      type: "create",
      user: null
    })
  const [staff, setStaff] = useState(dummyStaff)

  const [currentDisplayedManagementUser, setCurrentDisplayedManagementUser]
    = useState<{ users: User[], page_meta: PageMeta } | null>(null)

  const [currentDisplayedOnBoardTeachera, setCurrentDisplayedOnBoardTeachera]
    = useState<{ users: User[], page_meta: PageMeta } | null>(null)


  const handleEditUser = (user: User) => {
    setIsDialogForManagmentUserOpen({
      isOpen: true,
      type: "edit",
      user: { ...user }
    })
  }

  const handleAddUser = () => {
    setIsDialogForManagmentUserOpen({
      isOpen: true,
      type: "create",
      user: null
    })
  }

  const handleCloseDialogBox = useCallback(() => {
    setIsDialogForManagmentUserOpen({
      isOpen: false,
      type: "create",
      user: null
    });
  }, []);

  const handleConfigureStaff = (id: number) => {
    // Implement staff configuration logic
    toast({ title: "Configure Staff", description: "Staff configuration not implemented yet" })
  }

  const handleToggleStaffStatus = (id: number) => {
    setStaff(staff.map((s) => (s.id === id ? { ...s, status: s.status === "Active" ? "Inactive" : "Active" } : s)))
    toast({ title: "Staff status updated successfully" })
  }

  async function fetchDataForActiveTab(tab: 'management' | 'staff', page: number) {

    if (tab === 'management') {
      try {
        const response = await fetchUsers({ type: 'management', school_id: users!.school_id, page });
        setCurrentDisplayedManagementUser({
          users: response.data!.data,
          page_meta: response.data!.meta
        });
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    } else {
      try {
        const response = await fetchTeacherAsUser({ page: 1 });
        setCurrentDisplayedOnBoardTeachera({
          users: response.data!.data,
          page_meta: response.data!.meta
        });
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }
  }

  const handelPageChange = (page: number) => {
    fetchDataForActiveTab(activeTab as 'management' | 'staff', page);
  }

  function onSucssesfullChange(user: User | null) {
    if (isDialogForManagmentUserOpen.type === 'create') {
      let new_displayedManagementUser = currentDisplayedManagementUser;
      if (new_displayedManagementUser) {
        new_displayedManagementUser.users.unshift(user!);
        setCurrentDisplayedManagementUser(new_displayedManagementUser);
      }
    } else {
      let new_displayedManagementUser = currentDisplayedManagementUser;
      if (new_displayedManagementUser) {
        new_displayedManagementUser.users = new_displayedManagementUser.users.map((u) => {
          if (u.id === user!.id) {
            return user!;
          }
          return u;
        });
        setCurrentDisplayedManagementUser(new_displayedManagementUser);
      }
      setIsDialogForManagmentUserOpen({
        isOpen: false,
        type: "create",
        user: null
      })
    }
  }

  useEffect(() => {
    if (!currentDisplayedManagementUser || !currentDisplayedOnBoardTeachera) {
      fetchDataForActiveTab(activeTab as 'management' | 'staff', 1);
    }
  }, [activeTab]);

  if (isError) {
    return <div>There is something wrong</div>
  }


  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-primary mb-4 sm:mb-0">User Management</h2>
          {/* <div className="space-x-2">
            <Button variant="outline">
              <Upload className="mr-2 h-4 w-4" /> Import
            </Button>
            <Button variant="outline">
              <FileDown className="mr-2 h-4 w-4" /> Export
            </Button>
          </div> */}
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value)} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="management">Management Users</TabsTrigger>
            <TabsTrigger value="staff">Staff</TabsTrigger>
          </TabsList>
          <TabsContent value="management">
            {currentDisplayedManagementUser && <>
              <div className="flex justify-between flex-row-reverse items-center m-4">
                <Button onClick={handleAddUser}>
                  <Plus className="mr-2 h-4 w-4" /> Add User
                </Button>
              </div>
              <div className="overflow-x-auto">
                <ManagementUserTable
                  initalData={currentDisplayedManagementUser}
                  roles={managementRoles}
                  onEditUser={handleEditUser}
                  onPageChange={handelPageChange}
                />
              </div>
            </>}
            {
              isLoading && <div>Loading ....</div>
            }
          </TabsContent>
          <TabsContent value="staff">
            <div className="overflow-x-auto">
              {currentDisplayedOnBoardTeachera && (<TeacherAsUserTable
                initailData={{users : currentDisplayedOnBoardTeachera.users , page : currentDisplayedOnBoardTeachera.page_meta }}
              />)}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <Dialog open={isDialogForManagmentUserOpen.isOpen} onOpenChange={handleCloseDialogBox}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>{isDialogForManagmentUserOpen.type === 'edit' ? "Edit User" : "Add New User"}</DialogTitle>
            <DialogDescription>
              {isDialogForManagmentUserOpen.type === 'edit'
                ? "Make changes to the user details below."
                : "Fill in the details to create a new user."}
            </DialogDescription>
          </DialogHeader>
          <UserForm
            initialData={isDialogForManagmentUserOpen.user}
            roles={managementRoles}
            isEditing={isDialogForManagmentUserOpen.type === 'edit'}
            onSucssesfullChange={onSucssesfullChange}
          />
        </DialogContent>
      </Dialog>
    </Card>
  )
}

