/***
 * TODO :
 *
 * BUG :: Fix responsivenedd for this pagr
 * FIX :: Component workind properly need to add functionlity to dispaly live changes !
 *
 * - Open toast after reciving api responce
 * - Disable all action button while api is processing .
 * - put proper loaders/skeleton in place of loading
 */
import { useSelector, useDispatch } from 'react-redux';
import { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertCircle, AlertTriangle, Edit, Plus, Trash } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAppDispatch } from "@/redux/hooks/useAppDispatch";
import { useAppSelector } from "@/redux/hooks/useAppSelector";
import {
  createStaffRole,
  deleteStaffRole,
  updateStaffRole,
  useLazyGetSchoolStaffRoleQuery,
} from "@/services/StaffService";
// import { addRole, deleteRole, fetchRoles, updateRole } from "@/redux/slices/roleSlice"
import { StaffRole } from "@/types/staff";
import { selectSchoolStaffRoles } from "@/redux/slices/staffSlice";
import { selectAuthState } from "@/redux/slices/authSlice";
import { boolean, z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const formSchemaForStaffRole = z.object({
  role_id: z.number().nullable(),
  role_name: z
    .string()
    .min(3, "Role should be at least of 3 characters")
    .max(25, "Role should not be more than 15 characters")
    .regex(/^[a-zA-Z]+( [a-zA-Z]+)*$/, {
      message: "Only letters are allowed with a single space between words",
    }),
  role_type: z.enum(["non-teaching", "teaching"]),
  formType: z.enum(["create", "edit"]),
});

export default function StaffSettings() {
  const formForStaffRole = useForm<z.infer<typeof formSchemaForStaffRole>>({
    resolver: zodResolver(formSchemaForStaffRole),
    defaultValues: {
      role_id: null,
      role_name: "",
      role_type: "teaching",
      formType: "create",
    },
  });

  const dispatch = useAppDispatch();
  const authState = useAppSelector(selectAuthState);

  
  let StaffRoleState = useAppSelector(selectSchoolStaffRoles);
 

  const [
    getSchoolStaff,
    { data, isLoading, isFetching, isSuccess, isError, error },
  ] = useLazyGetSchoolStaffRoleQuery();

  const [selectedFilter, setSelectedFilter] = useState<
    "non-teaching" | "teaching" | "all"
  >("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDialogForDeleteStaffOpen, setIsDialogForDeleteStaffOpen] =
    useState<boolean>(false);
  const [displayedStaff, setDisplayedStaff] = useState<StaffRole[] | null>(
    null
  );

  const handleOpenDialog = (mode: "add" | "edit", role?: StaffRole) => {
    if (mode === "edit" && role) {
      formForStaffRole.reset({
        role_id: role.id,
        formType: "edit",
        role_name: role.role,
        role_type: role.isTeachingRole ? "teaching" : "non-teaching",
      });
    } else {
      formForStaffRole.reset({
        role_id: null,
        formType: "create",
        role_name: "",
        role_type: "teaching",
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };

  const handleSubmit = async () => {
    console.log("Check this I am inside");

    try {
      if (formForStaffRole.getValues("formType") === "edit") {
        let role_id = formForStaffRole.getValues("role_id");
        if (role_id) {
          await dispatch(
            updateStaffRole({
              staff_id: role_id,
              paylaod: { role: formForStaffRole.getValues("role_name") },
            })
          );
        } else {
          alert("Bug :: Role Id is not been provided !");
        }
        toast({
          title: "Role Update",
          description: `${formForStaffRole.getValues(
            "role_name"
          )} has been updated.`,
        });
      } else {
        await dispatch(
          createStaffRole({
            role: formForStaffRole.getValues("role_name"),
            is_teaching_role:
              formForStaffRole.getValues("role_type") === "teaching",
            school_id: authState.user!.schoolId,
          })
        ).unwrap();
        toast({
          title: "Role Created",
          description: `${formForStaffRole.getValues(
            "role_name"
          )} has been created.`,
        });
      }
      getSchoolStaff(authState.user!.schoolId);
      handleCloseDialog();
      
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${formForStaffRole.getValues(
          "formType"
        )} role. Please try again.`,
        variant: "destructive",
      });
    }
  };

  const handleDeleteRole = async (id: number) => {
    try {
      await dispatch(deleteStaffRole(id)).unwrap();
      toast({
        title: "Role Removed",
        description: "The role has been removed from the list.",
      });
      getSchoolStaff(authState.user!.schoolId);
      setIsDialogForDeleteStaffOpen(false);
    } catch (error) {
      alert("Check error in console ! ");
      toast({
        title: "Error",
        description: "Failed to delete role. Please try again.",
        variant: "destructive",
      });
    }
  };

  const onFilterChanage = (value: "non-teaching" | "teaching" | "all") => {
    setSelectedFilter(value);
    let filterd_array: StaffRole[] = [];
    if (value === "non-teaching") {
      filterd_array = StaffRoleState!.filter(
        (staff: StaffRole) => !staff.isTeachingRole
      );
    } else if (value === "teaching") {
      filterd_array = StaffRoleState!.filter(
        (staff: StaffRole) => staff.isTeachingRole
      );
    } else {
      filterd_array = StaffRoleState ? StaffRoleState : [];
    }
    setDisplayedStaff(filterd_array);
  };

  useEffect(() => {
    if (!StaffRoleState) {
      getSchoolStaff(authState.user!.schoolId);
    }
  }, []);

  useEffect(() => {
    if (StaffRoleState) {
      setDisplayedStaff(StaffRoleState);
    }
  }, [StaffRoleState]);

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Staff Settings</h1>
      {(isFetching || isLoading) && <div>Loading...</div>}
      {StaffRoleState && StaffRoleState.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Manage Staff Roles</CardTitle>
            <CardDescription>
              Add, edit, or remove staff roles for your school.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Roles</h2>
              <Button onClick={() => handleOpenDialog("add")}>
                <Plus className="mr-2 h-4 w-4" /> Add Role
              </Button>
            </div>
            <div className="flex space-x-4 justify-end mt-2 mb-2">
              {" "}
              {/* Container for side-by-side placement */}
              {/* Left Dropdown */}
              <div className="w-50">
                {" "}
                {/* Adjust width as needed */}
                <Select
                  value={selectedFilter}
                  onValueChange={(e: "non-teaching" | "teaching" | "all") =>
                    onFilterChanage(e)
                  }
                >
                  <SelectTrigger className="w-full">
                    {" "}
                    {/* Make trigger take full width */}
                    <SelectValue placeholder="Use Filter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem key="1" value="all">
                      All
                    </SelectItem>
                    <SelectItem key="2" value="teaching">
                      Teaching
                    </SelectItem>
                    <SelectItem key="3" value="non-teaching">
                      Non-Teaching
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Role Name</TableHead>
                    <TableHead>Role Type</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displayedStaff && displayedStaff.length > 0 && 
                    displayedStaff.map((staff, index) => {
                      return (
                        <TableRow key={index}>
                          <TableCell>{staff.role}</TableCell>
                          <TableCell>
                            {staff.isTeachingRole ? "Teaching" : "Non-Teaching"}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="outline"
                              onClick={() => handleOpenDialog("edit", staff)}
                            >
                              <Edit className="mr-2 h-4 w-4" /> Edit
                            </Button>
                            <Button
                            className="ms-2"
                              variant="outline"
                              onClick={() => {
                                formForStaffRole.setValue('role_id' , staff.id)
                               setIsDialogForDeleteStaffOpen(true)
                              }}
                            >
                              <Trash className="mr-2 h-4 w-4" /> Delete
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    {
                      displayedStaff && displayedStaff.length === 0 && (
                        <p>No Data Found for now</p>
                      )
                    }
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
      {StaffRoleState && StaffRoleState.length == 0 && (
        <Card className="border border-dashed border-gray-300 shadow-sm rounded-2xl text-center p-6 max-w-md mx-auto lg:mt-10">
          <CardHeader>
            <div className="flex justify-center text-red-500 mb-3">
              <AlertCircle className="w-12 h-12" />
            </div>
            <CardTitle className="text-xl font-semibold">
              No Staff Role Available
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Please cretae role for your school staff !.
            </p>
          </CardContent>
          <CardFooter className="flex justify-center space-x-4 mt-4">
            <Button variant="secondary">Refresh</Button>
            <Button onClick={() => handleOpenDialog("add")}>
              <Plus className="mr-2 h-4 w-4" /> Add Role
            </Button>
          </CardFooter>
        </Card>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {formForStaffRole.getValues("formType") === "create"
                ? "Add New Role"
                : "Edit Role"}
            </DialogTitle>
            <DialogDescription>
              {formForStaffRole.getValues("formType") === "create"
                ? "Enter the details of the new role here."
                : "Update the details of the role here."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Form {...formForStaffRole}>
              <form
                onSubmit={formForStaffRole.handleSubmit(handleSubmit)}
                className="space-y-6"
              >
                <FormField
                  control={formForStaffRole.control}
                  name="role_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role</FormLabel>
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
                      <FormLabel>Role Type</FormLabel>
                      <FormControl>
                        <Select
                          {...field}
                          value={field.value}
                          onValueChange={(value) => field.onChange(value)}
                          disabled={
                            formForStaffRole.getValues("formType") === "edit"
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select role type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="teaching">Teaching</SelectItem>
                            <SelectItem value="non-teaching">
                              Non-Teaching
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end space-x-4 pt-4">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleCloseDialog}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">
                    {formForStaffRole.getValues("formType") === "create"
                      ? "Add Role"
                      : "Update Role"}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isDialogForDeleteStaffOpen}
        onOpenChange={setIsDialogForDeleteStaffOpen}
      >
        <DialogContent className="max-w-md rounded-2xl shadow-lg">
          <DialogHeader className="text-center">
            <AlertTriangle className="text-red-600 w-7 h-7" />
            <DialogTitle className="text-2xl font-bold text-gray-800">
              Delete Confirmation
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Are you sure you want to Delete ?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 flex justify-center space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDialogForDeleteStaffOpen(false)}
              className="px-6 py-2 rounded-lg"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() =>
                handleDeleteRole(formForStaffRole.getValues("role_id")!)
              }
              className="px-6 py-2 rounded-lg"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
