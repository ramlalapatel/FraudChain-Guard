import { Account, Transaction } from '../types';
import { computeRiskScore } from '../utils/riskEngine';

export const INITIAL_ACCOUNTS: Account[] = [
  {
    id: 'ACC-VIC-01',
    name: 'Ramesh Kulkarni',
    account_type: 'Salaried',
    usual_monthly_credit_range: [30000, 75000],
    kyc_occupation: 'Pensioner / Retired Central Govt Employee',
    account_age: '8 years',
    risk_status: 'Potential Victim',
    current_balance: 14500,
    phone: '+91 98201 44810',
    city: 'Pune, Maharashtra',
    pan_masked: 'ABCDE****1F',
    upi_handle: 'ramesh.kulkarni@okhdfcbank',
    notes: 'Victim of SIM-swap & fake electricity bill APK scam. Filed 1930 Cyber Cell complaint.',
  },
  {
    id: 'ACC-FRD-01',
    name: 'Apex Digital Systems',
    account_type: 'Small Business',
    usual_monthly_credit_range: [50000, 200000],
    kyc_occupation: 'Freelance IT & SEO Consultancy',
    account_age: '3 months',
    risk_status: 'Under Investigation',
    current_balance: 8200,
    phone: '+91 99881 20491',
    city: 'Jamtara, Jharkhand',
    pan_masked: 'BFGPK****9M',
    upi_handle: 'apexconsultancy@icici',
    notes: 'Primary phishing collector account linked to 3 active National Cyber Crime Portal complaints.',
  },
  {
    id: 'ACC-MUL-01',
    name: 'Aarav Sharma',
    account_type: 'Student',
    usual_monthly_credit_range: [5000, 25000],
    kyc_occupation: 'Undergraduate Engineering Student (Tier-2 College)',
    account_age: '4 months',
    risk_status: 'Under Investigation',
    current_balance: 1240,
    phone: '+91 98114 90123',
    city: 'Jaipur, Rajasthan',
    pan_masked: 'CSAPK****4K',
    upi_handle: 'aarav.sharma23@oksbi',
    notes: 'Mule Layer 1: Recruited via Telegram "work-from-home commission" task scam. Bank account rented out.',
  },
  {
    id: 'ACC-MUL-02',
    name: 'Sunita Devi',
    account_type: 'Homemaker',
    usual_monthly_credit_range: [8000, 35000],
    kyc_occupation: 'Home Manager / Domestic Household',
    account_age: '11 months',
    risk_status: 'Under Investigation',
    current_balance: 3100,
    phone: '+91 97190 31849',
    city: 'Mathura, Uttar Pradesh',
    pan_masked: 'DQZPD****7L',
    upi_handle: 'sunita.devi44@paytm',
    notes: 'Mule Layer 2: Opened zero-balance Jan Dhan/Savings account, credentials sold to syndicate handler.',
  },
  {
    id: 'ACC-CSH-01',
    name: 'CoinBridge P2P OTC Desk',
    account_type: 'Corporate',
    usual_monthly_credit_range: [1500000, 7500000],
    kyc_occupation: 'P2P Cryptocurrency Liquidity Provider',
    account_age: '1 year',
    risk_status: 'Potentially Exposed',
    current_balance: 940000,
    phone: '+91 98700 99124',
    city: 'Bengaluru, Karnataka',
    pan_masked: 'AABCC****2Z',
    upi_handle: 'coinbridge.settle@axisbank',
    notes: 'Cash-out sink node. Receives high-velocity layered funds to exchange into USDT via OTC trade.',
  },
  {
    id: 'ACC-VIC-02',
    name: 'Priya Nambiar',
    account_type: 'Salaried',
    usual_monthly_credit_range: [80000, 160000],
    kyc_occupation: 'Sr. Product Marketing Lead',
    account_age: '4 years',
    risk_status: 'Potential Victim',
    current_balance: 92400,
    phone: '+91 98450 11920',
    city: 'Bengaluru, Karnataka',
    pan_masked: 'ALJPN****8R',
    upi_handle: 'priya.nambiar@ibl',
    notes: 'Victim of instant loan app extortion threat.',
  },
  {
    id: 'ACC-MUL-03',
    name: 'Karan Mehra',
    account_type: 'Student',
    usual_monthly_credit_range: [4000, 20000],
    kyc_occupation: 'B.Com Student (Commerce College)',
    account_age: '2 months',
    risk_status: 'Potentially Exposed',
    current_balance: 4200,
    phone: '+91 94120 77312',
    city: 'Indore, Madhya Pradesh',
    pan_masked: 'BMXPK****1C',
    upi_handle: 'karan.mehra99@ybl',
    notes: 'Smurfing aggregation node collecting small extortion credits before merging to Apex Digital.',
  },
  {
    id: 'ACC-CORP-01',
    name: 'Nexus Global Logistics Pvt Ltd',
    account_type: 'Corporate',
    usual_monthly_credit_range: [2500000, 15000000],
    kyc_occupation: 'Multimodal Freight Forwarding & Logistics',
    account_age: '9 years',
    risk_status: 'Under Investigation',
    current_balance: 4890000,
    phone: '+91 22 6124 9900',
    city: 'Mumbai, Maharashtra',
    pan_masked: 'AAACN****9T',
    upi_handle: 'nexuslogistics@kotak',
    notes: 'Corporate current account under high-scrutiny complaint regarding intercepted supplier wire.',
  },
  {
    id: 'ACC-LEG-01',
    name: 'Kavita Rao',
    account_type: 'Salaried',
    usual_monthly_credit_range: [70000, 140000],
    kyc_occupation: 'Staff Software Architect',
    account_age: '6 years',
    risk_status: 'Normal',
    current_balance: 185000,
    phone: '+91 99001 82341',
    city: 'Hyderabad, Telangana',
    pan_masked: 'CKYPR****5M',
    upi_handle: 'kavita.rao@hdfcbank',
    notes: 'Verified regular salary credit account. Zero flags.',
  },
  {
    id: 'ACC-LEG-02',
    name: 'Green Valley Supermarket',
    account_type: 'Small Business',
    usual_monthly_credit_range: [200000, 900000],
    kyc_occupation: 'FMCG Retail & Grocery Mart',
    account_age: '5 years',
    risk_status: 'Normal',
    current_balance: 310000,
    phone: '+91 98230 45678',
    city: 'Pune, Maharashtra',
    pan_masked: 'AAEFG****3P',
    upi_handle: 'greenvalleymart@icici',
    notes: 'Legitimate merchant QR settlement account with steady daily retail receipts.',
  },
  {
    id: 'ACC-LEG-03',
    name: 'Prestige Royal Palm Society',
    account_type: 'Corporate',
    usual_monthly_credit_range: [400000, 2000000],
    kyc_occupation: 'Apartment Owners Welfare Association',
    account_age: '7 years',
    risk_status: 'Normal',
    current_balance: 1420000,
    phone: '+91 80 4120 7800',
    city: 'Bengaluru, Karnataka',
    pan_masked: 'AABTP****0L',
    upi_handle: 'prestigeroyal.rwa@sbi',
    notes: 'Housing society maintenance escrow account.',
  },
  {
    id: 'ACC-LEG-04',
    name: 'Ananya Sen',
    account_type: 'Student',
    usual_monthly_credit_range: [6000, 28000],
    kyc_occupation: 'Industrial Design Student',
    account_age: '2 years',
    risk_status: 'Normal',
    current_balance: 8400,
    phone: '+91 98300 24156',
    city: 'Kolkata, West Bengal',
    pan_masked: 'DSAPS****2B',
    upi_handle: 'ananya.sen@okaxis',
    notes: 'Normal student account receiving monthly allowance from parents.',
  },
  {
    id: 'ACC-LEG-05',
    name: 'Dr. Arvind Swaminathan',
    account_type: 'Salaried',
    usual_monthly_credit_range: [120000, 250000],
    kyc_occupation: 'Consultant Orthopedic Surgeon',
    account_age: '12 years',
    risk_status: 'Normal',
    current_balance: 620000,
    phone: '+91 98400 90124',
    city: 'Chennai, Tamil Nadu',
    pan_masked: 'AFGPS****6G',
    upi_handle: 'arvind.swami@yesbank',
    notes: 'Consulting hospital honorarium and clinical practice account.',
  },
];

// Raw synthetic transactions
const RAW_TRANSACTIONS: Omit<Transaction, 'risk_score' | 'risk_band' | 'detected_signals'>[] = [
  // --- FRAUD CHAIN: 4-Hop Rapid Money Forwarding (Victim -> Fraudster -> Mule A -> Mule B -> Cash-out) ---
  {
    transaction_id: 'TXN-894201',
    sender_id: 'ACC-VIC-01', // Ramesh (Victim)
    receiver_id: 'ACC-FRD-01', // Apex Digital (Fraudster)
    amount: 485000,
    timestamp: '2026-09-25T10:14:00.000Z',
    display_time: 'Today, 10:14 AM',
    type: 'UPI',
    label: 'suspicious',
    signals: ['SENDER_SUSPICIOUS', 'UNUSUAL_AMOUNT'],
    investigation_status: 'Under Investigation',
    is_fraud_chain_part: true,
    chain_role: 'Victim Source',
    rapid_forward_minutes: 4,
    notes: [
      {
        id: 'N-01',
        author: 'NCRP Cyber Crime Portal',
        role: 'Automated Ingest',
        timestamp: '10:20 AM',
        text: 'Helpline 1930 report #CR-2026-8941: Complainant coerced into approving UPI intent request pretending to be MSEDCL power bill verification.',
      },
    ],
    complaint: {
      complaint_id: 'NCR-1930-89410',
      portal_ref: 'CYBER-MAH-2026-778',
      reported_at: '2026-09-25 10:20 AM',
      complainant_name: 'Ramesh Kulkarni',
      complainant_phone: '+91 98201 44810',
      category: 'UPI Impersonation / Fake Bill Threat',
      cyber_cell_division: 'Cyber Police Station Pune Crime Branch',
      analyst_notes: 'Urgent freeze advisory requested on beneficiary VPA apexconsultancy@icici.',
    },
  },
  {
    transaction_id: 'TXN-894202',
    sender_id: 'ACC-FRD-01', // Apex Digital
    receiver_id: 'ACC-MUL-01', // Aarav Sharma (Student Mule A)
    amount: 480000,
    timestamp: '2026-09-25T10:18:00.000Z',
    display_time: 'Today, 10:18 AM',
    type: 'IMPS',
    label: 'suspicious',
    signals: ['SENDER_SUSPICIOUS', 'LINKED_TO_SUSPICIOUS', 'UNUSUAL_AMOUNT', 'RAPID_MULTIHOP', 'NEW_SENDER'],
    investigation_status: 'Customer Verification Pending',
    is_fraud_chain_part: true,
    chain_role: 'Mule Account A',
    rapid_forward_minutes: 4,
    notes: [
      {
        id: 'N-02',
        author: 'Risk Engine Rule #204',
        role: 'Automated Bot',
        timestamp: '10:18 AM',
        text: 'TRIGGER 1 FIRED: Student account KYC monthly ceiling is ₹25,000. Incoming credit of ₹4,80,000 is 19.2x the max limit. Automated KYC proof request dispatched via SMS.',
      },
    ],
  },
  {
    transaction_id: 'TXN-894203',
    sender_id: 'ACC-MUL-01', // Aarav (Student Mule A)
    receiver_id: 'ACC-MUL-02', // Sunita Devi (Homemaker Mule B)
    amount: 465000,
    timestamp: '2026-09-25T10:24:00.000Z',
    display_time: 'Today, 10:24 AM',
    type: 'IMPS',
    label: 'suspicious',
    signals: ['SENDER_SUSPICIOUS', 'LINKED_TO_SUSPICIOUS', 'UNUSUAL_AMOUNT', 'RAPID_MULTIHOP'],
    investigation_status: 'Under Investigation',
    is_fraud_chain_part: true,
    chain_role: 'Mule Account B',
    rapid_forward_minutes: 6,
    notes: [
      {
        id: 'N-03',
        author: 'Fraud Risk Analyst (P. Varma)',
        role: 'Fraud Ops Level 2',
        timestamp: '10:26 AM',
        text: 'Velocity alert: Aarav forwarded 96.8% of inbound credit within 6 minutes to a rural Jan Dhan savings account. Clear layering signature.',
      },
    ],
  },
  {
    transaction_id: 'TXN-894204',
    sender_id: 'ACC-MUL-02', // Sunita Devi (Homemaker Mule B)
    receiver_id: 'ACC-CSH-01', // CoinBridge OTC (Cash-out)
    amount: 450000,
    timestamp: '2026-09-25T10:31:00.000Z',
    display_time: 'Today, 10:31 AM',
    type: 'NEFT',
    label: 'suspicious',
    signals: ['SENDER_SUSPICIOUS', 'LINKED_TO_SUSPICIOUS', 'RAPID_MULTIHOP', 'UNUSUAL_AMOUNT'],
    investigation_status: 'Escalated to LEA',
    is_fraud_chain_part: true,
    chain_role: 'Cash-Out Exit',
    rapid_forward_minutes: 7,
    notes: [
      {
        id: 'N-04',
        author: 'Lead AML Officer (S. Sen)',
        role: 'AML Compliance',
        timestamp: '10:35 AM',
        text: 'Beneficiary is CoinBridge P2P desk. Money exited banking rail into Tether (USDT). Inter-bank nodal alert sent to Axis Bank Nodal Officer.',
      },
    ],
  },

  // --- MULE COLLECTION RING / SMURFING PATTERN (Many-to-One into Apex) ---
  {
    transaction_id: 'TXN-894208',
    sender_id: 'ACC-VIC-02', // Priya Nambiar (Victim 2)
    receiver_id: 'ACC-MUL-03', // Karan Mehra (Student Mule C)
    amount: 75000,
    timestamp: '2026-09-25T10:02:00.000Z',
    display_time: 'Today, 10:02 AM',
    type: 'UPI',
    label: 'suspicious',
    signals: ['UNUSUAL_AMOUNT', 'NEW_SENDER'],
    investigation_status: 'Pending Review',
    is_fraud_chain_part: true,
    chain_role: 'Initial Intermediary',
    rapid_forward_minutes: 10,
    notes: [
      {
        id: 'N-05',
        author: 'Risk Engine',
        role: 'Automated Bot',
        timestamp: '10:02 AM',
        text: 'Unusual amount for student KYC limit (₹75k vs ₹20k ceiling).',
      },
    ],
  },
  {
    transaction_id: 'TXN-894209',
    sender_id: 'ACC-LEG-01', // Kavita Rao (Unaware transfer / spoofed invoice)
    receiver_id: 'ACC-MUL-03', // Karan Mehra (Student Mule C)
    amount: 82000,
    timestamp: '2026-09-25T10:08:00.000Z',
    display_time: 'Today, 10:08 AM',
    type: 'UPI',
    label: 'suspicious',
    signals: ['UNUSUAL_AMOUNT', 'LINKED_TO_SUSPICIOUS'],
    investigation_status: 'Customer Verification Pending',
    is_fraud_chain_part: true,
    chain_role: 'Initial Intermediary',
    rapid_forward_minutes: 4,
    notes: [],
  },
  {
    transaction_id: 'TXN-894210',
    sender_id: 'ACC-MUL-03', // Karan Mehra (Mule C)
    receiver_id: 'ACC-FRD-01', // Apex Digital (Consolidation)
    amount: 150000,
    timestamp: '2026-09-25T10:12:00.000Z',
    display_time: 'Today, 10:12 AM',
    type: 'IMPS',
    label: 'suspicious',
    signals: ['SENDER_SUSPICIOUS', 'LINKED_TO_SUSPICIOUS', 'RAPID_MULTIHOP'],
    investigation_status: 'Under Investigation',
    is_fraud_chain_part: true,
    chain_role: 'Initial Intermediary',
    notes: [
      {
        id: 'N-06',
        author: 'Graph Intelligence',
        role: 'Pattern Detector',
        timestamp: '10:13 AM',
        text: 'Aggregator smurfing detected: ACC-MUL-03 consolidated 2 inbound payments and forwarded ₹1.5L to Apex Digital in under 10 minutes.',
      },
    ],
  },

  // --- CORPORATE HIGH SCRUTINY TRIGGER (Trigger 2 Complaint scenario) ---
  {
    transaction_id: 'TXN-894215',
    sender_id: 'ACC-LEG-03', // Prestige Royal Palm
    receiver_id: 'ACC-CORP-01', // Nexus Global Logistics Ltd
    amount: 3450000,
    timestamp: '2026-09-25T09:40:00.000Z',
    display_time: 'Today, 09:40 AM',
    type: 'NEFT',
    label: 'suspicious',
    signals: ['LINKED_TO_SUSPICIOUS', 'NEW_SENDER'],
    investigation_status: 'Customer Verification Pending',
    is_fraud_chain_part: false,
    rapid_forward_minutes: 45,
    notes: [
      {
        id: 'N-07',
        author: 'Corporate Desk Supervisor',
        role: 'Risk Specialist',
        timestamp: '09:45 AM',
        text: 'High-value wire complaint logged from payer board: Impersonated vendor payment advice. Corporate entity required to submit GST tax invoice & board resolution before clearing.',
      },
    ],
    complaint: {
      complaint_id: 'CORP-DISP-3392',
      portal_ref: 'CMS-COMMERCIAL-2026-19',
      reported_at: '2026-09-25 09:44 AM',
      complainant_name: 'Prestige Royal Palm Escrow Trustee',
      complainant_phone: '+91 80 4120 7800',
      category: 'Vendor Email Compromise (BEC)',
      cyber_cell_division: 'Commercial Crimes Unit, Bangalore',
      analyst_notes: 'Urgent proof of delivery demanded under corporate high-scrutiny mandate.',
    },
  },

  // --- UNUSUAL TIME ANOMALY (2:45 AM Transfer) ---
  {
    transaction_id: 'TXN-894220',
    sender_id: 'ACC-VIC-02',
    receiver_id: 'ACC-FRD-01',
    amount: 60000,
    timestamp: '2026-09-25T02:45:00.000Z',
    display_time: 'Today, 02:45 AM',
    type: 'IMPS',
    label: 'suspicious',
    signals: ['UNUSUAL_TIME', 'LINKED_TO_SUSPICIOUS', 'NEW_SENDER'],
    investigation_status: 'Pending Review',
    notes: [
      {
        id: 'N-08',
        author: 'Night Watch Engine',
        role: 'Automated Bot',
        timestamp: '02:46 AM',
        text: 'Off-hours transaction initiated at 02:45 AM. Out-of-pattern device biometric session.',
      },
    ],
  },

  // --- LEGITIMATE NORMAL BACKGROUND TRANSACTIONS (15+ transactions) ---
  {
    transaction_id: 'TXN-101001',
    sender_id: 'ACC-LEG-01', // Kavita Rao
    receiver_id: 'ACC-LEG-02', // Green Valley Mart
    amount: 3450,
    timestamp: '2026-09-25T08:15:00.000Z',
    display_time: 'Today, 08:15 AM',
    type: 'UPI',
    label: 'normal',
    signals: [],
    investigation_status: 'Cleared',
    notes: [],
  },
  {
    transaction_id: 'TXN-101002',
    sender_id: 'ACC-LEG-05', // Dr. Arvind
    receiver_id: 'ACC-LEG-02', // Green Valley Mart
    amount: 1290,
    timestamp: '2026-09-25T08:30:00.000Z',
    display_time: 'Today, 08:30 AM',
    type: 'UPI',
    label: 'normal',
    signals: [],
    investigation_status: 'Cleared',
    notes: [],
  },
  {
    transaction_id: 'TXN-101003',
    sender_id: 'ACC-LEG-01', // Kavita Rao
    receiver_id: 'ACC-LEG-04', // Ananya Sen (Tuition fee / design tutoring)
    amount: 12000,
    timestamp: '2026-09-25T08:50:00.000Z',
    display_time: 'Today, 08:50 AM',
    type: 'UPI',
    label: 'normal',
    signals: [],
    investigation_status: 'Cleared',
    notes: [],
  },
  {
    transaction_id: 'TXN-101004',
    sender_id: 'ACC-VIC-01', // Ramesh Kulkarni (Normal groceries)
    receiver_id: 'ACC-LEG-02', // Green Valley Mart
    amount: 2150,
    timestamp: '2026-09-25T09:05:00.000Z',
    display_time: 'Today, 09:05 AM',
    type: 'UPI',
    label: 'normal',
    signals: [],
    investigation_status: 'Cleared',
    notes: [],
  },
  {
    transaction_id: 'TXN-101005',
    sender_id: 'ACC-LEG-05', // Dr. Arvind
    receiver_id: 'ACC-LEG-03', // Prestige Royal Palm (Maintenance fee)
    amount: 14500,
    timestamp: '2026-09-25T09:12:00.000Z',
    display_time: 'Today, 09:12 AM',
    type: 'IMPS',
    label: 'normal',
    signals: [],
    investigation_status: 'Cleared',
    notes: [],
  },
  {
    transaction_id: 'TXN-101006',
    sender_id: 'ACC-LEG-01', // Kavita Rao
    receiver_id: 'ACC-LEG-03', // Prestige Royal Palm
    amount: 14500,
    timestamp: '2026-09-25T09:15:00.000Z',
    display_time: 'Today, 09:15 AM',
    type: 'IMPS',
    label: 'normal',
    signals: [],
    investigation_status: 'Cleared',
    notes: [],
  },
  {
    transaction_id: 'TXN-101007',
    sender_id: 'ACC-LEG-02', // Green Valley Mart
    receiver_id: 'ACC-CORP-01', // Nexus Global Logistics (Cold freight delivery)
    amount: 88500,
    timestamp: '2026-09-25T09:20:00.000Z',
    display_time: 'Today, 09:20 AM',
    type: 'NEFT',
    label: 'normal',
    signals: [],
    investigation_status: 'Cleared',
    notes: [],
  },
  {
    transaction_id: 'TXN-101008',
    sender_id: 'ACC-VIC-02', // Priya Nambiar
    receiver_id: 'ACC-LEG-04', // Ananya Sen (Freelance logo design)
    amount: 15000,
    timestamp: '2026-09-25T09:35:00.000Z',
    display_time: 'Today, 09:35 AM',
    type: 'UPI',
    label: 'normal',
    signals: [],
    investigation_status: 'Cleared',
    notes: [],
  },
  {
    transaction_id: 'TXN-101009',
    sender_id: 'ACC-LEG-05', // Dr. Arvind
    receiver_id: 'ACC-LEG-01', // Kavita Rao (Book co-author settlement)
    amount: 25000,
    timestamp: '2026-09-25T09:50:00.000Z',
    display_time: 'Today, 09:50 AM',
    type: 'IMPS',
    label: 'normal',
    signals: [],
    investigation_status: 'Cleared',
    notes: [],
  },
  {
    transaction_id: 'TXN-101010',
    sender_id: 'ACC-LEG-04', // Ananya Sen
    receiver_id: 'ACC-LEG-02', // Green Valley Mart
    amount: 680,
    timestamp: '2026-09-25T10:00:00.000Z',
    display_time: 'Today, 10:00 AM',
    type: 'UPI',
    label: 'normal',
    signals: [],
    investigation_status: 'Cleared',
    notes: [],
  },
  {
    transaction_id: 'TXN-101011',
    sender_id: 'ACC-CORP-01', // Nexus Logistics
    receiver_id: 'ACC-LEG-05', // Dr. Arvind (Occupational health retainer)
    amount: 45000,
    timestamp: '2026-09-25T10:05:00.000Z',
    display_time: 'Today, 10:05 AM',
    type: 'NEFT',
    label: 'normal',
    signals: [],
    investigation_status: 'Cleared',
    notes: [],
  },
  {
    transaction_id: 'TXN-101012',
    sender_id: 'ACC-LEG-03', // Prestige Royal Palm
    receiver_id: 'ACC-LEG-02', // Green Valley Mart (Society canteen supplies)
    amount: 18200,
    timestamp: '2026-09-25T10:22:00.000Z',
    display_time: 'Today, 10:22 AM',
    type: 'UPI',
    label: 'normal',
    signals: [],
    investigation_status: 'Cleared',
    notes: [],
  },
  {
    transaction_id: 'TXN-101013',
    sender_id: 'ACC-LEG-02', // Green Valley Mart
    receiver_id: 'ACC-LEG-01', // Kavita Rao (Store loyalty cash refund)
    amount: 420,
    timestamp: '2026-09-25T10:38:00.000Z',
    display_time: 'Today, 10:38 AM',
    type: 'UPI',
    label: 'normal',
    signals: [],
    investigation_status: 'Cleared',
    notes: [],
  },
  {
    transaction_id: 'TXN-101014',
    sender_id: 'ACC-VIC-01', // Ramesh Kulkarni
    receiver_id: 'ACC-LEG-05', // Dr. Arvind (Clinic consultation fee)
    amount: 1500,
    timestamp: '2026-09-25T10:45:00.000Z',
    display_time: 'Today, 10:45 AM',
    type: 'UPI',
    label: 'normal',
    signals: [],
    investigation_status: 'Cleared',
    notes: [],
  },
];

/**
 * Initializes and scores all seed transactions using the deterministic engine.
 */
export function initializeSeedTransactions(accounts: Account[]): Transaction[] {
  const accountsMap = new Map(accounts.map((a) => [a.id, a]));

  return RAW_TRANSACTIONS.map((raw) => {
    const receiver = accountsMap.get(raw.receiver_id);
    const result = computeRiskScore(raw, accountsMap);

    let profile_deviation;
    if (receiver) {
      const [, maxLimit] = receiver.usual_monthly_credit_range;
      if (raw.amount > maxLimit * 1.5) {
        profile_deviation = {
          account_limit_max: maxLimit,
          multiplier: Number((raw.amount / maxLimit).toFixed(1)),
          is_mismatch: true,
        };
      }
    }

    return {
      ...raw,
      risk_score: result.score,
      risk_band: result.band,
      detected_signals: result.detectedSignals,
      label: result.label,
      profile_deviation,
    };
  });
}
