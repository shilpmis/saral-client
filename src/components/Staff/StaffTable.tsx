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
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { SaralPagination } from "../ui/common/SaralPagination";
import { OtherStaff, TeachingStaff } from "@/types/staff";

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


  const perPageData = 6;
  const totalPages = staffList.page_meta.last_page;

  const handelPageChange = (upadatedPage: number) => {
    onPageChange(upadatedPage);
  };

  return (
    <div className="w-full overflow-auto">
      {staffList.staff && staffList.staff.length > 0 ? (
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
                <TableCell>{staff.first_name} {staff.middle_name} {staff.last_name}</TableCell>
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
                  <DropdownMenu>
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
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
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
