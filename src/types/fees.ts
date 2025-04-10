import { Student } from "./student";

export interface FeesType {
  id: number;
  school_id: number;
  academic_session_id: number;
  name: string;
  description: string;
  status: "Active" | "Inactive";
  // is_concession_applicable: boolean,
}

export interface Concession {
  id: number;
  school_id: number;
  academic_session_id: number;
  name: string;
  description: string;
  applicable_to: "plan" | "students";
  concessions_to: "fees_type" | "plan";
  status: "Active" | "Inactive";
  category: "family" | "sports" | "staff" | "education" | "financial" | "other";
}

export interface ReqBodyForApplyConsessionToPlan {
  concession_id: number;
  fees_plan_id: number;
  fees_type_ids: number[] | null;
  deduction_type: "percentage" | "fixed_amount";
  amount: number | null;
  percentage: number | null;
}
export interface ReqBodyForApplyConsessionToStudent {
  concession_id: number;
  student_id: number;
  fees_plan_id: number;
  fees_type_ids: number[] | null;
  deduction_type: "percentage" | "fixed_amount";
  amount: number | null;
  percentage: number | null;
}

export interface ConcessionDetailForPlan {
  concession_id: number;
  academic_session_id: number;
  fees_plan_id: number;
  fees_type_id: number;
  deduction_type: "percentage" | "fixed_amount";
  amount: number | null;
  percentage: number | null;
  status: "Active" | "Inactive";
  concession: Concession;
  fees_plan: FeesPlan;
}

export interface FeesPlan {
  id: number;
  name: string;
  division_id: number;
  academic_session_id: number;
  description: string;
  total_amount: number;
  status: "Active" | "Inactive";
  concession: ConcessionDetailForPlan[];
}

export interface FeesPlanDetail {
  id: number;
  academic_session_id: number;
  fees_plan_id: number;
  fees_type_id: number;
  total_installment: number;
  installment_type:
    | "Admission"
    | "Monthly"
    | "Quarterly"
    | "Half Yearly"
    | "Yearly";
  total_amount: number;
  status: "Active" | "Inactive";
}

export interface InstallmentBreakdowns {
  fee_plan_details_id: number;
  installment_no: number;
  installment_amount: string;
  due_date: string;
  status: "Active" | "Inactive";
}

export interface DetailFeesPlan {}

export interface ReqObjectForCreateFeesPlan {
  fees_plan: Pick<FeesPlan, "division_id" | "name" | "description">;
  plan_details: {
    fees_type_id: number;
    installment_type: string;
    total_installment: number;
    total_amount: string;
    installment_breakDowns: Pick<
      InstallmentBreakdowns,
      "installment_no" | "due_date" | "installment_amount"
    >[];
  }[];
}

export interface ReqObjectForUpdateFeesPlan {
  fees_plan: Partial<Pick<FeesPlan, "name" | "description">>;
  plan_details?: {
    fees_type_id: number;
    installment_type: string;
    total_installment: number;
    total_amount: string;
    installment_breakDowns: Pick<
      InstallmentBreakdowns,
      "installment_no" | "due_date" | "installment_amount"
    >[];
  }[];
}

export interface DetailedFeesPlan {
  fees_plan: FeesPlan;
  fees_types: {
    fees_type: FeesPlanDetail;
    installment_breakDowns: InstallmentBreakdowns[];
  }[];
  consession: ConcessionDetailForPlan[];
}

// Types for fees module

export interface FeeStatus {
  student_id: number;
  academic_session_id: number;
  fees_plan_id: number;
  discounted_amount: number;
  paid_amount: number;
  total_amount: string;
  due_amount: string;
  status: "Pending" | "Partially Paid" | "Paid" | "Overdue";
  paid_fees: StudentFeesInstallment[];
}

export interface StudentWithFeeStatus {
  id: number;
  first_name: string;
  middle_name: string;
  last_name: string;
  gr_no: number;
  roll_number: number;
  fees_status: FeeStatus;
}

export interface InstallmentBreakdown {
  id: number;
  fee_plan_details_id: number;
  installment_no: number;
  installment_amount: string;
  due_date: string;
  status: "Active" | "Paid" | "Overdue";
}

export interface StudentFeesInstallment {
  id: number;
  student_fees_master_id: number;
  installment_id: number;
  paid_amount: number;
  remaining_amount: number;
  discounted_amount: number;
  paid_as_refund: boolean;
  refunded_amount: number;
  payment_mode: "Cash" | "Online" | "Bank Transfer";
  transaction_reference: string | null;
  payment_date: string;
  remarks: "Done";
  status: "Pending" | "Partially Paid" | "Paid" | "Overdue" | "Failed";
}

export interface FeePlanDetail {
  id: number;
  academic_session_id: number;
  fees_plan_id: number;
  fees_type_id: number;
  installment_type: "Admission" | "Monthly" | "Half Yearly" | "Yearly";
  total_installment: number;
  total_amount: string;
  status: "Active" | "Inactive";
  installments_breakdown: InstallmentBreakdown[];
}

export interface FeePlan {
  id: number;
  name: string;
  academic_session_id: number;
  description: string;
  class_id: number;
  total_amount: string;
  status: "Active" | "Inactive";
  concession_for_plan: AppliedConcessioinToStudent[];
}

export interface StudentFeeDetails {
  student: {
    id: number;
    first_name: string;
    middle_name: string;
    last_name: string;
    gr_no: number;
    roll_number: number;
    class_id: number;
    fees_status: FeeStatus & { id: number };
    provided_concession: AppliedConcessioinToStudent[];
  };
  detail: {
    fees_details: FeePlanDetail[];
    fees_plan: FeePlan;
    paid_fees: StudentFeesInstallment[];
    wallet: {
      total_concession_for_student: number;
      total_concession_for_plan: number;
    };
  };
}

export interface FeePaymentRequest {
  fee_plan_details_id: number;
  installment_id: number;
  discounted_amount: number;
  paid_amount: number;
  paid_as_refund: boolean;
  refunded_amount: number;
  payment_mode: "Cash" | "Online" | "Cheque" | "Bank Transfer";
  transaction_reference: string;
  payment_date: string;
  remarks: string;
  // status: "Paid";
}

export interface FeePaymentFormData {
  installment_ids: number[];
  payment_mode: "Cash" | "Online" | "Cheque" | "Bank Transfer";
  transaction_reference: string;
  payment_date: string;
  remarks: string;
}

export interface ConcessionFormData {
  amount: number;
  reason: string;
}

export interface AppliedConcessioinToPlan {
  id: number;
  concession_id: number;
  fees_plan_id: number;
  fees_type_id: number | null;
  deduction_type: "percentage" | "amount";
  amount: string | null;
  percentage: string | null;
  status: "Active" | "Inactive";
  fees_plan?: FeesPlan;
  fees_type?: FeesType;
  student?: Partial<Student>;
}

export interface ApplyConcessionRequest {
  concession_id: number;
  fees_plan_id: number;
  fees_type_id: number | null;
  deduction_type: "percentage" | "amount";
  amount: number | null;
  percentage: number | null;
}

export interface AppliedConcessioinToStudent {
  id: number;
  academic_session_id: number;
  concession_id: number;
  student_id: number;
  fees_plan_id: number;
  fees_type_id: number | null;
  deduction_type: "percentage" | "fixed_amount";
  amount: number | null;
  percentage: number | null;
  status: "Active" | "Inactive";
  fees_plan?: FeesPlan;
  fees_type?: FeesPlanDetail;
  student?: Partial<Student>;
  concession: Concession;
}

export interface ConcessionDetails {
  concession: Concession;
  concession_holder_plans: AppliedConcessioinToPlan[] | null;
  concession_holder_students?: AppliedConcessioinToStudent[] | null;
}
