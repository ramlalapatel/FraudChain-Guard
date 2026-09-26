export type AccountType = 'Student' | 'Homemaker' | 'Salaried' | 'Small Business' | 'Corporate';

export type AccountRiskStatus = 'Normal' | 'Potentially Exposed' | 'Potential Victim' | 'Under Investigation';

export type TransactionType = 'UPI' | 'IMPS' | 'NEFT';

export type RiskBand = 'Low' | 'Medium' | 'High' | 'Critical';

export interface Account {
  id: string;
  name: string;
  account_type: AccountType;
  usual_monthly_credit_range: [number, number];
  kyc_occupation: string;
  account_age: string;
  risk_status: AccountRiskStatus;
  current_balance: number;
  phone: string;
  city: string;
  pan_masked: string;
  upi_handle?: string;
  notes?: string;
}

export interface RiskSignalRule {
  code: string;
  name: string;
  points: number;
  description: string;
  category: 'Entity Risk' | 'Network Link' | 'Behavioral' | 'Velocity & Amount' | 'Temporal';
}

export interface DetectedSignal {
  code: string;
  name: string;
  points: number;
  description: string;
  explanation: string;
}

export interface EvidenceSubmission {
  purposeCategory: 'Salary' | 'Business Sale of Goods' | 'Service Fee' | 'Loan Repayment' | 'Family Transfer' | 'Rental Income' | 'Other';
  description: string;
  documentName?: string;
  submittedAt: string;
  status: 'submitted' | 'denied' | 'pending';
  denialReason?: string;
}

export interface CyberComplaint {
  complaint_id: string;
  portal_ref: string;
  reported_at: string;
  complainant_name: string;
  complainant_phone: string;
  category: string;
  cyber_cell_division: string;
  analyst_notes: string;
}

export interface CaseNote {
  id: string;
  author: string;
  role: string;
  timestamp: string;
  text: string;
}

export interface Transaction {
  transaction_id: string;
  sender_id: string;
  receiver_id: string;
  amount: number;
  timestamp: string;
  display_time: string;
  type: TransactionType;
  label: 'normal' | 'suspicious';
  risk_score: number;
  risk_band: RiskBand;
  signals: string[]; // Codes of active signals
  detected_signals: DetectedSignal[];
  investigation_status: 'Pending Review' | 'Customer Verification Pending' | 'Customer Confirmed' | 'Under Investigation' | 'Cleared' | 'Escalated to LEA';
  notes: CaseNote[];
  is_fraud_chain_part?: boolean;
  chain_role?: 'Victim Source' | 'Initial Intermediary' | 'Mule Account A' | 'Mule Account B' | 'Cash-Out Exit';
  rapid_forward_minutes?: number; // Minutes between incoming credit and outgoing transfer
  complaint?: CyberComplaint;
  evidence?: EvidenceSubmission;
  profile_deviation?: {
    account_limit_max: number;
    multiplier: number;
    is_mismatch: boolean;
  };
}

export interface RiskBandStats {
  low: number;
  medium: number;
  high: number;
  critical: number;
  total: number;
}
