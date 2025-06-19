
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
import { SaralPagination } from "../ui/common/SaralPagination";
import { StaffRole, StaffType } from "@/types/staff";
import dynamic from "next/dynamic"
import StaffPdfDilog from "./StaffPdfDilog";
import { Trash2 } from "lucide-react";
import { PageMeta } from "@/types/global";
import { useTranslation } from "@/redux/hooks/useTranslation";

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
  onDelete,
  onPageChange
}: {
  staffList: { staff: StaffType[], page_meta: PageMeta };
  onEdit: (staff_id: number) => void;
  onPageChange: (page: number) => void;
  onDelete: (staff_id: number) => void;
  setDefaultRoute?: number;
  type: 'teaching' | 'non-teaching'
}) {

  const StafftDetailsPDF = dynamic(() => import("./StaffPdf"), {
    ssr: false,
    loading: () => <p>Loading PDF generator...</p>,
  })

  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedStaff, setSelectedStaff] = useState<StaffType | null>(null)

  const handleStaffClick = (staff: StaffType) => {
    setSelectedStaff(staff)
    setDialogOpen(true)
  }
  const perPageData = 6;
  const totalPages = staffList.page_meta.last_page;

  const { t } = useTranslation();

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
                <TableHead>{t("name")}</TableHead>
                <TableHead>{t("gender")}</TableHead>
                <TableHead>{t("email")}</TableHead>
                <TableHead>{t("mobile")}</TableHead>
                <TableHead>{t("aadhar_no")}</TableHead>
                <TableHead>{t("DOJ")}</TableHead>
                <TableHead>{t("designation")}</TableHead>
                <TableHead>{t("current_status")}</TableHead>
                <TableHead>{t("actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {staffList.staff && staffList.staff.map((staff) => (
                <TableRow key={staff.id}>
                  <TableCell>
                    <button
                      className="text-blue-600 hover:underline focus:outline-none"
                      onClick={() => handleStaffClick(staff)}
                    >
                      {staff.first_name} {staff.middle_name} {staff.last_name}
                    </button>
                  </TableCell>
                  <TableCell>{staff.gender}</TableCell>
                  <TableCell>
                    {isValidEmail(staff.email) ? (
                      staff.email
                    ) : (
                      <span className="text-red-500">{t("N/A")}</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {isValidMobile(staff.mobile_number) ? (
                      staff.mobile_number
                    ) : (
                      <span className="text-red-500">{"N/A"}</span>
                    )}
                  </TableCell>
                  <TableCell>{staff.aadhar_no ?? "N/A"}</TableCell>
                  <TableCell>
                    {staff.joining_date
                      ? new Date(staff.joining_date).toLocaleDateString("en-GB")
                      : "-"}
                    </TableCell>
                  <TableCell>{staff.role}</TableCell>
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
                      {t("edit")}
                    </Button>
                    {/* <Button className="ms-2" variant="outline" onClick={() => onDelete(staff.id)}>
                      <Trash2 className="text-red-500" />
                    </Button> */}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {selectedStaff && (
            <StaffPdfDilog
            dialogOpen={dialogOpen}
            setDialogOpen={setDialogOpen}
            selectedStaff={selectedStaff}
            StaffDetailsPDF={StafftDetailsPDF}
          />)}
          <SaralPagination
            currentPage={staffList.page_meta.current_page ?? staffList.page_meta.currentPage}
            totalPages={staffList.page_meta.last_page ?? staffList.page_meta.lastPage}
            onPageChange={handelPageChange}
          />

        </>
      ) : (
        <div className="text-center py-4 text-gray-500">{t("no_records_found")}</div>
      )}
    </div>
  );
}
