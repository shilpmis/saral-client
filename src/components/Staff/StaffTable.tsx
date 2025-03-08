import type React from "react";
import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronLeft, ChevronRight, FileText, MoreHorizontal, X } from "lucide-react";
import { SaralPagination } from "../ui/common/SaralPagination";
import { OtherStaff, StaffRole, TeachingStaff } from "@/types/staff";
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import dynamic from "next/dynamic"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Separator } from "@radix-ui/react-separator";


interface PageMeta {
  total: number,
  per_page: number,
  current_page: number,
  last_page: number,
  first_page: number,
  first_page_url: string,
  last_page_url: string,
}

const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const isValidMobile = (mobile: number): boolean => {
  const mobileRegex = /^[6-9]\d{9}$/;
  return mobileRegex.test(mobile.toString());
};


export default function StaffTable({
  type,
  staffList,
  onEdit,
  onPageChange
}: {
  staffList: { staff: TeachingStaff[] | OtherStaff[], page_meta: PageMeta };
  onEdit: (staff_id: number) => void;
  onPageChange: (page: number) => void;
  setDefaultRoute?: number;
  type: 'teaching' | 'non-teaching'
}) {

   const StafftDetailsPDF = dynamic(() => import("./StaffPdf"), {
      ssr: false,
      loading: () => <p>Loading PDF generator...</p>,
    })
  
    const PDFDownloadLink = dynamic(() => import("@react-pdf/renderer").then((mod) => mod.PDFDownloadLink), {
      ssr: false,
    })
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedStaff, setSelectedStaff] = useState<any>(null)
  const handleStaffClick = (staff:any) => {
    setSelectedStaff(staff)
    setDialogOpen(true)
    console.log("staff is here=>>",selectedStaff);
    
  }
  const perPageData = 6;
  const totalPages = staffList.page_meta.last_page;

  const handelPageChange = (upadatedPage: number) => {
    onPageChange(upadatedPage);
  };

  return (
    <div className="w-full overflow-auto">
      {staffList.staff && staffList.staff.length > 0 ? (
        <>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Mobile</TableHead>
              <TableHead>Designation</TableHead>
              <TableHead>Current Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {staffList.staff && staffList.staff.map((staff) => (
              <TableRow key={staff.id}>
                <TableCell>{staff.id}</TableCell>
                <TableCell>
                <button
                  className="text-blue-600 hover:underline focus:outline-none"
                  onClick={() => handleStaffClick(staff)}
                >
                  {staff.first_name} {staff.middle_name} {staff.last_name}
                </button>
                  </TableCell>
                <TableCell>
                  {isValidEmail(staff.email) ? (
                    staff.email
                  ) : (
                    <span className="text-red-500">Invalid Email</span>
                  )}
                </TableCell>
                <TableCell>
                  {isValidMobile(staff.mobile_number) ? (
                    staff.mobile_number
                  ) : (
                    <span className="text-red-500">Invalid Mobile</span>
                  )}
                </TableCell>
                <TableCell>{staff.role_meta.role}</TableCell>
                <TableCell>{staff.employment_status}</TableCell>
                <TableCell>
                  {/* <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="h-8 w-8 p-0"
                      // disabled={
                      //   !isValidEmail(staff.email) ||
                      //   !isValidMobile(staff.mobile)
                      // }
                      >
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem
                        onClick={() =>
                          navigator.clipboard.writeText(staff.id.toString())
                        }
                      >
                        Copy staff ID
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => onEdit(staff.id)}>
                        Edit staff
                      </DropdownMenuItem>
                      <DropdownMenuItem>Delete staff</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu> */}
                  <Button variant="outline" onClick={() => onEdit(staff.id)}>
                    Edit
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden">
          <div className="flex justify-between items-center p-4 md:p-6 sticky top-0 bg-background z-10 border-b">
            <DialogTitle className="text-xl md:text-2xl font-bold">Staff Details</DialogTitle>
            <div className="flex items-center gap-2">
            {selectedStaff && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div>
                        {typeof window !== "undefined" && (
                          <PDFDownloadLink
                            document={<StafftDetailsPDF staff={selectedStaff} />}
                            fileName={`${selectedStaff.first_name}_${selectedStaff.last_name}_details.pdf`}
                          >
                            {({ blob, url, loading, error }: { blob: Blob | null; url: string | null; loading: boolean; error: Error | null }) => (
                              <Button
                                variant="outline"
                                size="icon"
                                disabled={loading}
                                aria-label="Download PDF"
                              >
                                <FileText className="h-4 w-4" />
                              </Button>
                            )}
                          </PDFDownloadLink>
                        )}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Download PDF</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              <Button variant="ghost" size="icon" onClick={() => setDialogOpen(false)} aria-label="Close">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="max-h-[80vh] overflow-y-auto p-4 md:p-6">
            {selectedStaff && (
              <div className="space-y-6">
                {/* Staff Profile Section */}
                <div className="flex flex-col items-start justify-start">
                  <div className="bg-primary/10 rounded-full p-6 mb-4 border-4 border-primary/20">
                    {selectedStaff.gender.toLowerCase() === "male" ? (
                     <img 
                     src="https://img.freepik.com/premium-vector/man-professional-business-casual-young-avatar-icon-illustration_1277826-623.jpg?w=900"
                     alt="Male Student"
                     className="h-24 w-24 md:h-32 md:w-32 rounded-full"
                   />
                    ) : (
                      <img 
                      src="https://img.freepik.com/free-vector/woman-with-long-brown-hair-pink-shirt_90220-2940.jpg?t=st=1741346084~exp=1741349684~hmac=8fb79fbe2b8651184e68b2303365403937006e7dc31d5335f32abf58e7e2b083&w=900" // Replace with your male image path
                      alt="Male Student"
                      className="h-24 w-24 md:h-32 md:w-32 rounded-full"
                    />
                    )}
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-center">
                    {selectedStaff.first_name} {selectedStaff.middle_name} {selectedStaff.last_name}
                  </h2>
                  <div className="flex flex-wrap gap-2 mt-2 justify-center">
                    <Badge variant="outline" className="text-sm">
                      Id: {selectedStaff.id}
                    </Badge>
                    <Badge variant="outline" className="text-sm">
                      Role: {selectedStaff.role_meta.role}
                    </Badge>
                  </div>
                </div>

                <Separator />

                {/* Details Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Basic Information */}
                  <Card>
                    <CardContent className="p-4 md:p-6">
                      <h3 className="text-lg font-semibold mb-4 text-primary">Personal Information</h3>
                      <div className="space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                          <p className="text-muted-foreground">First Name:</p>
                          <p className="font-medium">{selectedStaff.first_name}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <p className="text-muted-foreground">Middle Name:</p>
                          <p className="font-medium">{selectedStaff.middle_name}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <p className="text-muted-foreground">Last Name:</p>
                          <p className="font-medium">{selectedStaff.last_name}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <p className="text-muted-foreground">First Name (Guj):</p>
                          <p className="font-medium">{selectedStaff.first_name_in_guj}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <p className="text-muted-foreground">middle Name(Guj)</p>
                          <p className="font-medium">{selectedStaff.middle_name_in_guj}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <p className="text-muted-foreground">Last Name(Guj)</p>
                          <p className="font-medium">{selectedStaff.last_name_in_guj}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <p className="text-muted-foreground">Gender:</p>
                          <p className="font-medium">{selectedStaff.gender}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <p className="text-muted-foreground">Dob:</p>
                          <p className="font-medium">{selectedStaff.birth_date}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <p className="text-muted-foreground">Place</p>
                          <p className="font-medium">{selectedStaff.city}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <p className="text-muted-foreground">District</p>
                          <p className="font-medium">{selectedStaff.district}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <p className="text-muted-foreground">Adhar No:</p>
                          <p className="font-medium">{selectedStaff.aadhar_no}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <p className="text-muted-foreground">Adhar Dise No:</p>
                          <p className="font-medium">{null}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Contact Details */}
                  <Card>
                    <CardContent className="p-4 md:p-6">
                      <h3 className="text-lg font-semibold mb-4 text-primary">Contact Details</h3>
                      <div className="space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                          <p className="text-muted-foreground">Mobile No:</p>
                          <p className="font-medium">{selectedStaff.mobile_number}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <p className="text-muted-foreground">Email:</p>
                          <p className="font-medium">{selectedStaff.email}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Other Information */}
                  <Card>
                    <CardContent className="p-4 md:p-6">
                      <h3 className="text-lg font-semibold mb-4 text-primary">Other Information</h3>
                      <div className="space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                          <p className="text-muted-foreground">Religion:</p>
                          <p className="font-medium">{selectedStaff.religiion}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <p className="text-muted-foreground">Religion(Guj):</p>
                          <p className="font-medium">{selectedStaff.religiion_in_guj}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <p className="text-muted-foreground">Caste:</p>
                          <p className="font-medium">{selectedStaff.caste}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <p className="text-muted-foreground">Caste(Guj):</p>
                          <p className="font-medium">{selectedStaff.caste_in_guj}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <p className="text-muted-foreground">Category:</p>
                          <p className="font-medium">{selectedStaff.category}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                   {/* Address Information */}
                   <Card>
                    <CardContent className="p-4 md:p-6">
                      <h3 className="text-lg font-semibold mb-4 text-primary">Address Information</h3>
                      <div className="space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                          <p className="text-muted-foreground">Address:</p>
                          <p className="font-medium">{selectedStaff.address}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <p className="text-muted-foreground">District:</p>
                          <p className="font-medium">{selectedStaff.district}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <p className="text-muted-foreground">City:</p>
                          <p className="font-medium">{selectedStaff.city}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <p className="text-muted-foreground">Postal Code:</p>
                          <p className="font-medium">{selectedStaff.postal_code}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <p className="text-muted-foreground">State:</p>
                          <p className="font-medium">{selectedStaff.state}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* bank Details */}
                  <Card className="md:col-span-2">
                    <CardContent className="p-4 md:p-6">
                      <h3 className="text-lg font-semibold mb-4 text-primary">Bank Details</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <p className="text-muted-foreground">Bank Name:</p>
                          <p className="font-medium">{selectedStaff.bank_name}</p>
                        </div>
                        <div className="space-y-2">
                          <p className="text-muted-foreground">Account Name:</p>
                          <p className="font-medium">{selectedStaff.account_no}</p>
                        </div>
                        <div className="space-y-2">
                          <p className="text-muted-foreground">IFSC Code:</p>
                          <p className="font-medium">{selectedStaff.IFSC_code}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                    {/* Employment Details */}
                    <Card className="md:col-span-2">
                    <CardContent className="p-4 md:p-6">
                      <h3 className="text-lg font-semibold mb-4 text-primary">Employment Details</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <p className="text-muted-foreground">Joining Date:</p>
                          <p className="font-medium">{selectedStaff.joining_date}</p>
                        </div>
                        <div className="space-y-2">
                          <p className="text-muted-foreground">Employment Status:</p>
                          <p className="font-medium">{selectedStaff.employment_status}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
        </>
      ) : (
        <div className="text-center py-4 text-gray-500">No records found</div>
      )}
      <SaralPagination
        currentPage={staffList.page_meta.current_page}
        totalPages={totalPages}
        onPageChange={handelPageChange}
      />
    </div>
  );
}
