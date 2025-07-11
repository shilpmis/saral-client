import { useState, useEffect } from "react"
import { toast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { AlertCircle, AlertTriangle, Edit, Plus, Trash } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useAppDispatch } from "@/redux/hooks/useAppDispatch"
import { useAppSelector } from "@/redux/hooks/useAppSelector"
import { createStaffRole, deleteStaffRole, updateStaffRole, useLazyGetSchoolStaffRoleQuery } from "@/services/StaffService"
// import { addRole, deleteRole, fetchRoles, updateRole } from "@/redux/slices/roleSlice"
import { StaffRole } from "@/types/staff"
import { selectSchoolStaffRoles } from "@/redux/slices/staffSlice"
import { selectActiveAccademicSessionsForSchool, selectAuthState } from "@/redux/slices/authSlice"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { useTranslation } from "@/redux/hooks/useTranslation"


const formSchemaForStaffRole = z.object({
  role_id: z.number().nullable(),
  role_name: z
    .string()
    .min(3, 'Role should be at least of 3 characters')
    .max(20, 'Role should not be more than 20 characters')
    .regex(/^[a-zA-Z]+( [a-zA-Z]+)*$/, {
      message: "Only letters are allowed with a single space between words",
    }),
  role_type: z.enum(['non-teaching', 'teaching']),
  formType: z.enum(["create", "edit"])
})

export default function StaffSettings() {

  const formForStaffRole = useForm<z.infer<typeof formSchemaForStaffRole>>({
    resolver: zodResolver(formSchemaForStaffRole),
    defaultValues: {
      role_id: null,
      role_name: "",
      role_type: "teaching",
      formType: 'create'
    },
  })


  const dispatch = useAppDispatch()
  const authState = useAppSelector(selectAuthState)
  const StaffRoleState = useAppSelector(selectSchoolStaffRoles)
  const CurrentAcademicSessionForSchool = useAppSelector(selectActiveAccademicSessionsForSchool)
  const [
    getSchoolStaff, 
    { data, isLoading, isFetching, isSuccess, isError, error },
  ] = useLazyGetSchoolStaffRoleQuery();
 
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDialogForDeleteStaffOpen, setIsDialogForDeleteStaffOpen] = useState<boolean>(false)
  const {t} = useTranslation()
  const [showNoActiveSessionAlert, setShowNoActiveSessionAlert] = useState(false);

  useEffect(() => {
    if (!CurrentAcademicSessionForSchool) {
      setShowNoActiveSessionAlert(true);
    }
  }, [CurrentAcademicSessionForSchool]);


  const handleOpenDialog = (mode: "add" | "edit", role?: StaffRole) => {

    if (mode === "edit" && role) {
      formForStaffRole.reset({
        role_id: role.id,
        formType: 'edit',
        role_name: role.role,
        role_type: role.is_teaching_role ? 'teaching' : 'non-teaching'
      })
    } else {
      formForStaffRole.reset({
        role_id: null,
        formType: 'create',
        role_name: "",
        role_type: 'teaching'
      })
    }
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
  }

  const handleSubmit = async () => {

    try {
      if (formForStaffRole.getValues('formType') === "edit") {
        let role_id = formForStaffRole.getValues('role_id')
        if (role_id) {
          await dispatch(updateStaffRole({
            staff_id: role_id,
            payload: { role: formForStaffRole.getValues('role_name') }
          }))
        } else {
          alert("Bug :: Role Id is not been provided !")
        }
        toast({
          title: "Role Updated",
          description: `${formForStaffRole.getValues('role_name')} has been updated.`,
        })
      } else {
        let new_staff = await dispatch(createStaffRole({
          payload: {
            role: formForStaffRole.getValues('role_name'),
            is_teaching_role: formForStaffRole.getValues('role_type') === 'teaching',
            school_id: authState.user!.school_id,
          },
          academic_session: CurrentAcademicSessionForSchool!.id
        }))
        if (new_staff.meta.requestStatus === 'rejected') {
          toast({
            variant: "destructive",
            title: "Error !",
            description: `${new_staff.payload.message} !`,
          })
        } else {
          toast({
            title: "Role Created !",
            description: `${formForStaffRole.getValues('role_name')} has been created.`,
          })
          handleCloseDialog()
        }
      }
      getSchoolStaff(authState.user!.school_id);
      handleCloseDialog()
    } catch (error) {
      toast({
        // title: "Error",
        title: `Failed to ${formForStaffRole.getValues('formType')} role. Already Present`,
        variant: "destructive",
      })
    }
  }

  const handleDeleteRole = async (id: number) => {
    try {
      const res = await dispatch(deleteStaffRole(id)).unwrap()
      console.log(res)
      toast({
        title: "Role Removed",
        description: "The role has been removed from the list.",
      })
      setIsDialogForDeleteStaffOpen(false)
      getSchoolStaff(authState.user!.school_id);
      handleCloseDialog()
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: error.message,
        description: "Failed to delete role ."
      })
    }
  }

  useEffect(() => {
    if (!StaffRoleState) {
      getSchoolStaff(authState.user!.school_id)
    }
  }, [])



  if (isLoading) return <div>Loading...</div>

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">{t("staff_settings")}</h1>
        {(isFetching || isLoading) && <div>Loading...</div>}
        {StaffRoleState && StaffRoleState.length > 0 && (<Card>
          <CardHeader>
            <CardTitle className="text-2xl">{t("manage_satff_designation")}</CardTitle>
            <CardDescription>{t("add,_edit,_or_remove_staff_roles_for_your_school")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">{t("roles")}</h2>
              <Button onClick={() => handleOpenDialog("add")}>
                <Plus className="mr-2 h-4 w-4" />{t("add_role")} 
              </Button>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("role_name")}</TableHead>
                    <TableHead>{t("role_type")}</TableHead>
                    <TableHead className="text-right">{t("actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {StaffRoleState.map((staff) => (
                    <TableRow key={staff.id}>
                      <TableCell className="font-medium">{staff.role}</TableCell>
                      <TableCell>{staff.is_teaching_role ? "Teaching" : "Non-Teaching"}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          className="mr-2"
                          onClick={() => handleOpenDialog("edit", staff)}
                        >
                          <Edit className="h-4 w-4 mr-1" />{t("edit")}
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => {
                          formForStaffRole.setValue('role_id', staff.id)
                          setIsDialogForDeleteStaffOpen(true)
                        }}
                          className="hover:bg-red-600 hover:text-white"
                        >
                          <Trash className="h-4 w-4 mr-1" />{t("delete")}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>)}
        {StaffRoleState && StaffRoleState.length == 0 && (
          <Card className="border border-dashed border-gray-300 shadow-sm rounded-2xl text-center p-6 max-w-md mx-auto lg:mt-10">
            <CardHeader>
              <div className="flex justify-center text-red-500 mb-3">
                <AlertCircle className="w-12 h-12" />
              </div>
              <CardTitle className="text-xl font-semibold">{t("no_staff_role_available")}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">{t("please_create_role_for_your_school_staff!")}</p>
            </CardContent>
            <CardFooter className="flex justify-center space-x-4 mt-4">
              <Button variant="secondary">Refresh</Button>
              <Button onClick={() => handleOpenDialog("add")}>
                <Plus className="mr-2 h-4 w-4" />{t("add_role")}
              </Button>
            </CardFooter>
          </Card>
        )}

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{formForStaffRole.getValues('formType') === "create" ? t("add_new_role") : t("edit_role")}</DialogTitle>
              <DialogDescription>
                {formForStaffRole.getValues('formType') === "create"
                  ? t("enter_the_details_of_the_new_role_here.")
                  : t("update_the_details_of_the_role_here.")}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <Form {...formForStaffRole}>
                <form onSubmit={formForStaffRole.handleSubmit(handleSubmit)} className="space-y-6">
                  <FormField
                    control={formForStaffRole.control}
                    name="role_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel required>{t("designation")}</FormLabel>
                        <FormControl>
                          <Input type="text" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={formForStaffRole.control}
                    name="role_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("role_type")}</FormLabel>
                        <FormControl>
                          <Select
                            {...field}
                            value={field.value}
                            onValueChange={(value) => field.onChange(value)}
                            disabled={formForStaffRole.getValues('formType') === "edit"}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select role type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="teaching">{t("teaching")}</SelectItem>
                              <SelectItem value="non-teaching">{t("non_teaching")}</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex justify-end space-x-4 pt-4">
                    <Button type="button" variant="secondary" onClick={handleCloseDialog}>
                      {t("cancel")}
                    </Button>
                    <Button type="submit">
                      {formForStaffRole.getValues('formType') === "create" ? t("add_role") : t("update_role")}
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={isDialogForDeleteStaffOpen} onOpenChange={setIsDialogForDeleteStaffOpen}>
          <DialogContent className="max-w-md rounded-2xl shadow-lg">
            <DialogHeader className="text-center">
              <AlertTriangle className="text-red-600 w-7 h-7" />
              <DialogTitle className="text-2xl font-bold text-gray-800">{t("delete_confirmation")}</DialogTitle>
              <DialogDescription className="text-gray-600">
              {t("are_you_sure_you_want_to_delete ?")}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="mt-4 flex justify-center space-x-4">
              <Button type="button" variant="outline" onClick={() => setIsDialogForDeleteStaffOpen(false)} className="px-6 py-2 rounded-lg">
                {t("cancel")}
              </Button>
              <Button type="button" variant="destructive" onClick={() => handleDeleteRole(formForStaffRole.getValues('role_id')!)} className="px-6 py-2 rounded-lg bg-red-600 text-white">
                {t("delete")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </>
  )
}

