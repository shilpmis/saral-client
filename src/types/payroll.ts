// PayrollEntry Interface
export interface PayrollEntry {
    id: number;
    name: string;
    role: string;
    category: "admin" | "teaching" | "non-teaching";
    active: boolean;
    salary: {
      basic: number;
      gradePay: number;
      inflation: number;
      houseRentAllowance: number;
      permanentTravel: number;
      medicalAllowance: number;
      localAllowance: number;
      principalsAllowance: number;
      supervisor: number;
      highMedianAllowance: number;
      cashAllowance: number;
      disabilityAllowance: number;
      chargeAllowance: number;
      transportAllowance: number;
      ncash: number;
      ltc: number;
      specialSalary: number;
      bonus: number;
      ariasAllowance: number;
      additionalInflation: number;
      interimRelief: number;
      other: number;
      otherSalaryReason: string; // Non-numeric field
    };
    deductions: {
      gpf: number;
      cpf: number;
      gpfLoan: number;
      cpfLoan: number;
      housingLoan: number;
      incomeTax: number;
      professionalTax: number;
      insuranceDeduction: number;
      grainAdvance: number;
      festivalPrelude: number;
      cooperativeSociety1: number;
      cooperativeSociety2: number;
      recovery: number;
      groupInsurance: number;
      retailDiscount1: number;
      additionalGPF: number;
      ple: number;
      otherDeductions: number;
      otherDeductionReason: string; // Non-numeric field
    };
    lastPayDate: string;
  }
  